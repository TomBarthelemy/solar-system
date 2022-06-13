import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";

import * as dat from "lil-gui";
import * as THREE from "three";
import { PlaneteProps } from "../planete-props.model";

// const sunVertextShader = require('shaders/sun-vertex.glsl');
// const sunFragmentShader = require('shaders/sun-fragment.glsl');
// console.log(sunVertextShader)
// import testFragmentShader from '../shaders/fragment.glsl'
// import sunVertextShader from '../../assets/shaders/sun-vertex.glsl'
// import sunFragmentShader from '../shaders/sun-fragment.glsl'

@Component({
  selector: "app-solar-system",
  templateUrl: "./solar-system.component.html",
  styleUrls: ["./solar-system.component.scss"],
})
export class SolarSystemComponent implements OnInit, AfterViewInit {
  @ViewChild("canvas") private canvasRef: ElementRef;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  gui = new dat.GUI();

  private sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  private textureLoader = new THREE.TextureLoader();

  //  Colors textures
  private spaceTexture = this.textureLoader.load("/assets/textures/color/space-bis.jpg");
  private sunTexture = this.textureLoader.load("/assets/textures/color/sun.jpg");
  private mercureTexture = this.textureLoader.load("/assets/textures/color/mercure.jpg");
  private venusTexture = this.textureLoader.load("/assets/textures/color/venus.png");
  private earthTexture = this.textureLoader.load("/assets/textures/color/earth.png");
  private marsTexture = this.textureLoader.load("/assets/textures/color/mars.jpg");
  private jupiterTexture = this.textureLoader.load("/assets/textures/color/jupiter.jpg");
  private saturnTexture = this.textureLoader.load("/assets/textures/color/saturn.jpg");
  private saturnRingTexture = this.textureLoader.load("/assets/textures/color/saturn-ring.png");
  private uranusTexture = this.textureLoader.load("/assets/textures/color/uranus.jpg");
  private neptuneTexture = this.textureLoader.load("/assets/textures/color/neptune.jpg");

  //  Normals textures
  private normalTexture = this.textureLoader.load("/assets/textures/normal/normal.jpg");
  private sunNormalTexture = this.textureLoader.load("/assets/textures/normal/sun-normal.jpg");
  private jupiterNormalTexture = this.textureLoader.load("/assets/textures/normal/jupiter-normal.jpg");
  private uranusNormalTexture = this.textureLoader.load("/assets/textures/normal/uranus-normal.jpg");
  private neptuneNormalTexture = this.textureLoader.load("/assets/textures/normal/neptune-normal.jpg");

  private solarSystemProps = new Map();
  private solarSystemMesh = new Map();

  private scene = new THREE.Scene();

  private ambientLight = new THREE.AmbientLight(0xffffff, 1);

  private directionalLight = new THREE.DirectionalLight(0xffffff, 1);

  private camera = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100);

  private renderer: THREE.WebGLRenderer;

  // Customs shaders
  private sunVertexShader = `
  uniform vec3 viewVector;
  uniform float c;
  uniform float p;
  uniform vec2 uFrequency;
  uniform float uTime;
  
  varying float intensity;
  void main() 
  {
      vec3 vNormal = normalize( normalMatrix * normal );
      vec3 vNormel = normalize( normalMatrix * viewVector );
      intensity = pow( c - dot(vNormal, vNormel), p );
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      
  
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.5;
      modelPosition.z += sin(modelPosition.y * uFrequency.y - uTime) * 0.5;
  
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
      
      gl_Position = projectedPosition;
  }`;

  private sunFragmentShader = `
  uniform vec3 glowColor;
  varying float intensity;
  void main() 
  {
      vec3 glow = glowColor * intensity;
      gl_FragColor = vec4( glow, 1.0 );
  }`;

  private planetVertexShader = `
  uniform vec3 viewVector;
  uniform float c;
  uniform float p;
  varying float intensity;
  void main() 
  {
      vec3 vNormal = normalize( normalMatrix * normal );
      vec3 vNormel = normalize( normalMatrix * viewVector );
      intensity = pow( c - dot(vNormal, vNormel), p );
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`;

  private planetFragmentShader = `
  uniform vec3 glowColor;
  varying float intensity;
  void main() 
  {
      vec3 glow = glowColor * intensity;
      gl_FragColor = vec4( glow, 1.0 );
  }`;

  // Customs materials

  sunCustomMaterial = new THREE.ShaderMaterial({
    uniforms: {
      c: { value: 0.75 },
      p: { value: 6 },
      glowColor: { value: new THREE.Color("#ffff00") },
      viewVector: { value: this.camera.position },
      uFrequency: { value: new THREE.Vector2(10, 5) },
      uTime: { value: 0 },
    },
    vertexShader: this.sunVertexShader,
    fragmentShader: this.sunFragmentShader,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  });

  private solarSystemGroup = new THREE.Group();

  private cameraMinX = -4;
  private cameraMaxX = 35;

  private cameraMinZ = 5;
  private cameraMaxZ = 30;

  private mouseDown = false;
  private cursorX = 0;

  private clock = new THREE.Clock();

  private planetSpeedRotation = 0.1;

  constructor() {}

  ngOnInit(): void {
    this.setUpTextureEncoding();
    this.createPlanetesProps();
    this.setUpSceneCameraAndLight();
    this.setUpEventsListener();
    this.createMeshs();
    this.debug();
  }

  ngAfterViewInit(): void {
    this.startRenderingLoop();
  }

  startRenderingLoop() {
    //* Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 2;

    let component: SolarSystemComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.tick();
      component.renderer.render(component.scene, component.camera);
    })();
  }

  tick() {
    const elapsedTime = this.clock.getElapsedTime();

    // Animate meshes
    for (var [planetName, mesh] of this.solarSystemMesh.entries()) {
      let planetMesh = mesh.getObjectByName(planetName);
      let planetGlowMesh = mesh.getObjectByName(planetName + "-GLOW");

      if (planetName === "SUN") {
        planetMesh.rotation.y = elapsedTime * 0.01;
      } else if (planetName === "SATURN") {
        let ringMesh = mesh.getObjectByName("RING");
        ringMesh.rotation.y = elapsedTime * this.planetSpeedRotation;
        planetMesh.rotation.y = elapsedTime * this.planetSpeedRotation;
      } else {
        planetMesh.rotation.y = elapsedTime * this.planetSpeedRotation;
      }

      planetGlowMesh.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(this.camera.position, planetGlowMesh.position);
    }

    this.camera.lookAt(new THREE.Vector3(this.camera.position.x, 0, 0));

    // Update controls
    // controls.update()

    this.sunCustomMaterial.uniforms["uTime"].value = elapsedTime;
  }

  createMeshs() {
    this.scene.add(this.solarSystemGroup);

    for (var [planetName, props] of this.solarSystemProps.entries()) {
      const planetGroup = new THREE.Group();

      const sphereGeom = new THREE.SphereGeometry(props.scale, 32, 32);

      const planet = new THREE.Mesh(
        sphereGeom,
        new THREE.MeshStandardMaterial({
          normalMap: props.normalTexture,
          map: props.map,
          roughness: props.roughness,
        })
      );

      planet.name = planetName;
      planet.position.x = props.positionX;

      if (planetName === "SUN") {
        const sunGlow = new THREE.Mesh(sphereGeom.clone(), this.sunCustomMaterial.clone());
        sunGlow.position.x = props.positionX;
        sunGlow.name = planetName + "-GLOW";
        sunGlow.scale.multiplyScalar(1.25);

        planetGroup.add(planet);
        planetGroup.add(sunGlow);
      } else {
        var customMaterial = new THREE.ShaderMaterial({
          uniforms: {
            c: { value: 0.6 },
            p: { value: 6 },
            glowColor: { value: new THREE.Color(props.glowColor) },
            viewVector: { value: this.camera.position },
          },
          vertexShader: this.planetVertexShader,
          fragmentShader: this.planetFragmentShader,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
        });

        const planetGlow = new THREE.Mesh(sphereGeom.clone(), customMaterial.clone());
        planetGlow.position.x = props.positionX;
        planetGlow.scale.multiplyScalar(1.1);
        planetGlow.name = planetName + "-GLOW";

        planetGroup.add(planet);
        planetGroup.add(planetGlow);
      }

      if (planetName === "SATURN") {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(7, 10, 30),
          new THREE.MeshStandardMaterial({
            map: props.ringMap,
            roughness: props.ringRoughness,
            metalness: props.ringMetalness,
            side: THREE.DoubleSide,
          })
        );

        ring.name = "RING";
        ring.position.x = props.positionX;
        ring.rotateX(-Math.PI * 0.25);
        ring.rotateY(-Math.PI * 0.25);
        planet.rotateZ(-Math.PI * 0.25);
        ring.scale.set(props.ringScale, props.ringScale, props.ringScale);

        planetGroup.add(ring);
      }

      this.solarSystemGroup.add(planetGroup);
      this.solarSystemMesh.set(planetName, planetGroup);
    }
  }

  setUpSceneCameraAndLight() {
    this.scene.background = this.spaceTexture;

    // set up camera
    this.camera.position.x = 12;
    this.camera.position.y = 2;
    this.camera.position.z = 30;
    this.camera.lookAt(new THREE.Vector3(this.camera.position.x, 0, 0));
    this.scene.add(this.camera);

    //  set up light
    this.directionalLight.position.x = -9;
    this.directionalLight.position.y = 0;
    this.directionalLight.position.z = 0;
    this.directionalLight.rotateY(Math.PI * 0.5);

    this.scene.add(this.directionalLight);
    this.scene.add(this.ambientLight);
  }

  setUpTextureEncoding(): void {
    this.spaceTexture.encoding = THREE.sRGBEncoding;
    this.sunTexture.encoding = THREE.sRGBEncoding;
    this.mercureTexture.encoding = THREE.sRGBEncoding;
    this.venusTexture.encoding = THREE.sRGBEncoding;
    this.earthTexture.encoding = THREE.sRGBEncoding;
    this.marsTexture.encoding = THREE.sRGBEncoding;
    this.jupiterTexture.encoding = THREE.sRGBEncoding;
    this.saturnTexture.encoding = THREE.sRGBEncoding;
    this.saturnRingTexture.encoding = THREE.sRGBEncoding;
    this.uranusTexture.encoding = THREE.sRGBEncoding;
    this.neptuneTexture.encoding = THREE.sRGBEncoding;
  }

  createPlanetesProps(): void {
    // ------------ SUN ------------
    const SUN = {
      scale: 20,
      positionX: -30,
      roughness: 1,
      map: this.sunTexture,
      normalTexture: this.sunNormalTexture,
      glowColor: "#ffff00",
    };

    // ------------ MERCURE ------------
    const MERCURE = {
      scale: 0.8,
      positionX: -4,
      roughness: 0.4,
      map: this.mercureTexture,
      normalTexture: this.normalTexture,
      glowColor: "#ae9a76",
    };

    // ------------ VENUS ------------
    const VENUS = {
      scale: 1.2,
      positionX: 0,
      roughness: 0.6,
      map: this.venusTexture,
      normalTexture: this.normalTexture,
      glowColor: "#dcb67c",
    };

    // ------------ EARTH ------------
    const EARTH = {
      scale: 1.4,
      positionX: 5,
      roughness: 0.6,
      map: this.earthTexture,
      normalTexture: this.normalTexture,
      glowColor: "#5e6daa",
    };

    // ------------ MARS ------------
    const MARS = {
      scale: 1.1,
      positionX: 10,
      roughness: 0.7,
      map: this.marsTexture,
      normalTexture: this.normalTexture,
      glowColor: "#e3683e",
    };
    // ------------ JUPITER ------------
    const JUPITER = {
      scale: 2.5,
      positionX: 16,
      roughness: 0.8,
      map: this.jupiterTexture,
      normalTexture: this.jupiterNormalTexture,
      glowColor: "#eecbaa",
    };

    // ------------ SATURN ------------
    const SATURN = {
      scale: 1.6,
      positionX: 23,
      roughness: 0.85,
      map: this.saturnTexture,
      normalTexture: this.normalTexture,
      ringScale: 0.3,
      ringMap: this.saturnRingTexture,
      ringRoughness: 0.4,
      ringMetalness: 0.5,
      glowColor: "#ffe786",
    };
    // ------------ URANUS ------------
    const URANUS = {
      scale: 1.4,
      positionX: 29,
      roughness: 0.9,
      map: this.uranusTexture,
      normalTexture: this.uranusNormalTexture,
      glowColor: "#3feee8",
    };
    // ------------ NEPTUNE ------------
    const NEPTUNE = {
      scale: 1.6,
      positionX: 35,
      roughness: 0.9,
      map: this.neptuneTexture,
      normalTexture: this.neptuneNormalTexture,
      glowColor: "#5b9dfb",
    };

    this.solarSystemProps.set("SUN", SUN);
    this.solarSystemProps.set("MERCURE", MERCURE);
    this.solarSystemProps.set("VENUS", VENUS);
    this.solarSystemProps.set("EARTH", EARTH);
    this.solarSystemProps.set("MARS", MARS);
    this.solarSystemProps.set("JUPITER", JUPITER);
    this.solarSystemProps.set("SATURN", SATURN);
    this.solarSystemProps.set("URANUS", URANUS);
    this.solarSystemProps.set("NEPTUNE", NEPTUNE);
  }

  setUpEventsListener(): void {
    window.addEventListener("mousedown", (event) => {
      event.preventDefault();
      this.cursorX = event.clientX / this.sizes.width;
      this.mouseDown = true;
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.mouseDown) {
        return;
      } // is the button pressed?

      event.preventDefault();
      const deltaX = event.clientX / this.sizes.width - this.cursorX;
      this.cursorX = event.clientX / this.sizes.width;
      this.dragAction(-deltaX);
    });
    window.addEventListener("mouseup", (event) => {
      event.preventDefault();
      this.mouseDown = false;
    });

    // EVENT : controle du 'zoom' avec la roulette ou le double-tap sur smartphone
    window.addEventListener("wheel", (event) => {
      const delta = Math.sign(event.deltaY);
      this.zoomAction(delta);
    });

    // EVENT : pour gerer le resize auto de la scene (askip)
    window.addEventListener("resize", () => {
      // Update sizes
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      // Update camera
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  dragAction(deltaX): void {
    if (this.camera.position.x + deltaX > this.cameraMaxX) {
      this.camera.position.x = this.cameraMaxX;
    } else if (this.camera.position.x + deltaX < this.cameraMinX) {
      this.camera.position.x = this.cameraMinX;
    } else {
      this.camera.position.x += deltaX * 15;
    }
  }

  zoomAction(delta): void {
    if (this.camera.position.z + delta > this.cameraMaxZ) {
      this.camera.position.z = this.cameraMaxZ;
    } else if (this.camera.position.z + delta < this.cameraMinZ) {
      this.camera.position.z = this.cameraMinZ;
    } else {
      this.camera.position.z += delta * 2;
    }
  }

  debug() {
    const cameraGui = this.gui.addFolder('Camera')
    cameraGui.add(this.camera.position, 'x').min(this.cameraMinX).max(this.cameraMaxX).name('Scroll Horizontal')
    cameraGui.add(this.camera.position, 'z').min(this.cameraMinZ).max(this.cameraMaxZ).name('Zoom')
  }
}
