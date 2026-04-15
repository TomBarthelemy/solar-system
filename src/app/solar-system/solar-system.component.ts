import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";

import * as THREE from "three";
import { PlaneteProps } from "../planete-props.model";
import { gsap } from 'gsap';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import glsl from 'glslify';

// @ts-ignore
import sunVertexShader  from '../../assets/shaders/sun-vertex.glsl' ;
// @ts-ignore
import sunFragmentShader  from '../../assets/shaders/sun-fragment.glsl' ;
// @ts-ignore
import planetVertexShader  from '../../assets/shaders/vertex.glsl' ;
// @ts-ignore
import planetFragmentShader  from '../../assets/shaders/fragment.glsl' ;




@Component({
  selector: "app-solar-system",
  templateUrl: "./solar-system.component.html",
  styleUrls: ["./solar-system.component.scss"],
})
export class SolarSystemComponent implements OnInit, AfterViewInit {
  @ViewChild("canvas") private canvasRef: ElementRef;
  private loadingBarElement ;

  private mouse = new THREE.Vector2();
  private mouseRayCaster = new THREE.Raycaster();

  private cameraMinX = 2;
  private cameraMaxX = 32;

  private cameraMinZ = 5;
  private cameraMaxZ = 30;

  private mouseDown = false;
  private cursorX = 0;

  private planetSpeedRotation = 0.1;

  private defaultGlow = 0.6;
  private hoverGlow = 0.8;

  selectedPlanet: string | null = null;
  private clickStartX = 0;
  private clickStartY = 0;
  private hasDragged = false;

  // ── Planet drag-rotation (detail view) ─────────────────────────
  private planetDragActive = false;
  private planetDragLastX = 0;
  private planetDragLastY = 0;
  private planetDragRotY = 0;   // accumulated Y rotation
  private planetDragRotX = 0;   // accumulated X rotation
  private planetDragVelY = 0;   // inertia velocity Y
  private planetDragVelX = 0;   // inertia velocity X
  planetDragUsed = false;       // hides the hint after first use

  readonly planetOrder = ['SUN', 'MERCURE', 'VENUS', 'EARTH', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE'];

  get selectedPlanetIndex(): number {
    if (!this.selectedPlanet) return -1;
    return this.planetOrder.indexOf(this.selectedPlanet);
  }

  navigatePlanet(direction: -1 | 1): void {
    const idx = this.selectedPlanetIndex;
    if (idx === -1) return;
    const next = (idx + direction + this.planetOrder.length) % this.planetOrder.length;
    this.focusPlanet(this.planetOrder[next], direction);
  }

  readonly planetData: Record<string, {
    displayName: string;
    type: string;
    description: string;
    diameter: string;
    distanceFromSun: string;
    moons: number | string;
    orbitalPeriod: string;
    temperature: string;
  }> = {
    'SUN': {
      displayName: 'Soleil',
      type: 'Étoile - naine jaune G2V',
      description: 'Notre étoile, au cœur du système solaire. Elle représente 99,8 % de la masse totale du système et son énergie est produite par fusion nucléaire.',
      diameter: '1 392 700 km',
      distanceFromSun: '-',
      moons: '-',
      orbitalPeriod: '-',
      temperature: '5 500°C (surface) · ~15 M°C (cœur)',
    },
    'MERCURE': {
      displayName: 'Mercure',
      type: 'Planète tellurique',
      description: 'La plus petite planète du système solaire et la plus proche du Soleil. Sans atmosphère significative, ses températures varient drastiquement.',
      diameter: '4 879 km',
      distanceFromSun: '57,9 millions km',
      moons: 0,
      orbitalPeriod: '88 jours',
      temperature: '-180°C à +430°C',
    },
    'VENUS': {
      displayName: 'Vénus',
      type: 'Planète tellurique',
      description: 'La planète la plus chaude du système solaire, enveloppée d\'une épaisse atmosphère de CO₂ créant un effet de serre extrême.',
      diameter: '12 104 km',
      distanceFromSun: '108,2 millions km',
      moons: 0,
      orbitalPeriod: '225 jours',
      temperature: '+465°C (moyenne)',
    },
    'EARTH': {
      displayName: 'Terre',
      type: 'Planète tellurique',
      description: 'Notre maison. La seule planète connue à abriter la vie, avec de l\'eau liquide en surface et une atmosphère riche en azote et oxygène.',
      diameter: '12 742 km',
      distanceFromSun: '149,6 millions km',
      moons: 1,
      orbitalPeriod: '365,25 jours',
      temperature: '-88°C à +58°C',
    },
    'MARS': {
      displayName: 'Mars',
      type: 'Planète tellurique',
      description: 'La planète rouge. Elle abrite Olympus Mons, le plus grand volcan du système solaire, et Valles Marineris, le plus vaste canyon.',
      diameter: '6 779 km',
      distanceFromSun: '227,9 millions km',
      moons: 2,
      orbitalPeriod: '687 jours',
      temperature: '-143°C à +35°C',
    },
    'JUPITER': {
      displayName: 'Jupiter',
      type: 'Géante gazeuse',
      description: 'La plus grande planète du système solaire. Sa Grande Tache Rouge est une tempête anticyclonique active depuis plus de 350 ans.',
      diameter: '139 820 km',
      distanceFromSun: '778,5 millions km',
      moons: 95,
      orbitalPeriod: '11,9 ans',
      temperature: '-110°C (nuages)',
    },
    'SATURN': {
      displayName: 'Saturne',
      type: 'Géante gazeuse',
      description: 'Célèbre pour ses spectaculaires anneaux composés de glace et de roches. La moins dense de toutes les planètes - plus légère que l\'eau.',
      diameter: '116 460 km',
      distanceFromSun: '1 432 millions km',
      moons: 146,
      orbitalPeriod: '29,5 ans',
      temperature: '-140°C (nuages)',
    },
    'URANUS': {
      displayName: 'Uranus',
      type: 'Géante de glace',
      description: 'Son axe de rotation est incliné à 98°, la faisant orbiter pratiquement "couchée sur le côté". Sa couleur cyan vient du méthane atmosphérique.',
      diameter: '50 724 km',
      distanceFromSun: '2 867 millions km',
      moons: 27,
      orbitalPeriod: '84 ans',
      temperature: '-224°C (nuages)',
    },
    'NEPTUNE': {
      displayName: 'Neptune',
      type: 'Géante de glace',
      description: 'La planète la plus éloignée du Soleil. Ses vents sont les plus violents du système solaire, atteignant +2 000 km/h.',
      diameter: '49 244 km',
      distanceFromSun: '4 495 millions km',
      moons: 16,
      orbitalPeriod: '165 ans',
      temperature: '-218°C (nuages)',
    },
  };

  get selectedPlanetColor(): string {
    if (!this.selectedPlanet) return 'rgba(255,255,255,0.3)';
    const props = this.solarSystemProps.get(this.selectedPlanet);
    return props?.glowColor ?? 'rgba(255,255,255,0.3)';
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  private loadingManager = new THREE.LoadingManager(
    //  loaded
    () => 
    {
      gsap.delayedCall(0.5, () => {
        gsap.to(this.overlayMaterial.uniforms['uAlpha'], {duration: 3, value : 0})
        this.loadingBarElement.classList.add('ended')
        this.loadingBarElement.style.transform = ''
      })
    },

    //  progress
    (itemUrl, itemsLoaded, itemsTotal) => {
      const progressRatio = itemsLoaded / itemsTotal
      this.loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
  )

  private textureLoader = new THREE.TextureLoader(this.loadingManager);

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

  private camera = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 300);

  private renderer: THREE.WebGLRenderer;

  // Customs materials

  sunCustomMaterial = new THREE.ShaderMaterial({
    uniforms: {
      c: { value: 1.0 },
      p: { value: 1.8 },
      viewVector: { value: this.camera.position },
      uTime: { value: 0 },
    },
    vertexShader: sunVertexShader,
    fragmentShader: sunFragmentShader,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  private sunOuterCorona = new THREE.ShaderMaterial({
    uniforms: {
      c: { value: 0.12 },
      p: { value: 1.6 },
      glowColor: { value: new THREE.Color("#ff8800") },
      viewVector: { value: new THREE.Vector3() },
    },
    vertexShader: planetVertexShader,
    fragmentShader: planetFragmentShader,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  /**
   * Overlay
   */
  private overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
  private overlayMaterial = new THREE.ShaderMaterial({
    transparent:true,
    uniforms: 
    {
      uAlpha: { value : 1}
    },
    vertexShader: `
      void main()
      {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uAlpha;

      void main()
      {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
      }
    `
  })

  private solarSystemGroup = new THREE.Group();

  private clock = new THREE.Clock();

  constructor() {}

  ngOnInit(): void {

    this.loadingBarElement = document.querySelector('.loading-bar')

    this.setUpLoading()
    this.setUpTextureEncoding();
    this.createPlanetesProps();
    this.setUpSceneCameraAndLight();
    this.setUpEventsListener();
    this.createMeshs();
  }
  setUpLoading() {
    const overlay = new THREE.Mesh(this.overlayGeometry, this.overlayMaterial)
    this.scene.add(overlay)
  }

  ngAfterViewInit(): void {
    // this.controls = new OrbitControls(this.camera, this.canvas)
    // this.controls.enableDamping = true
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

    // ─ Planet drag-rotation inertia & auto-spin (detail view) ──────────
    if (this.selectedPlanet && !this.planetDragActive) {
      this.planetDragVelY *= 0.90;
      this.planetDragVelX *= 0.90;
      this.planetDragRotY += this.planetDragVelY;
      this.planetDragRotX += this.planetDragVelX;
      // Clamp X so the planet never flips upside down
      this.planetDragRotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, this.planetDragRotX));
      // Resume gentle auto-spin once inertia dies out
      if (Math.abs(this.planetDragVelY) < 0.0005) {
        this.planetDragRotY += 0.0003;
      }
    }

    this.camera.lookAt(new THREE.Vector3(this.camera.position.x, 0, 0));

    // Background planets rotate slowly in detail view (×0.08)
    const bgSpeed = this.selectedPlanet ? this.planetSpeedRotation * 0.08 : this.planetSpeedRotation;

    // Animate meshes
    for (var [planetName, mesh] of this.solarSystemMesh.entries()) {
      let planetMesh = mesh.getObjectByName(planetName);
      let planetGlowMesh = mesh.getObjectByName(planetName + "-GLOW");

      if (planetName === "SUN") {
        if (this.selectedPlanet === 'SUN') {
          planetMesh.rotation.y = this.planetDragRotY;
          planetMesh.rotation.x = this.planetDragRotX;
        } else {
          const sunSpeed = this.selectedPlanet ? 0.001 : 0.01;
          planetMesh.rotation.y = elapsedTime * sunSpeed;
        }
        // Update inner flame corona viewVector (world position, because group.position.y animates)
        if (planetGlowMesh) {
          const wp = planetGlowMesh.getWorldPosition(new THREE.Vector3());
          planetGlowMesh.material.uniforms["viewVector"].value =
            new THREE.Vector3().subVectors(this.camera.position, wp);
        }
        // Update outer soft corona viewVector
        const outerGlow = mesh.getObjectByName("SUN-OUTER-GLOW") as THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
        if (outerGlow) {
          const wp = outerGlow.getWorldPosition(new THREE.Vector3());
          outerGlow.material.uniforms["viewVector"].value =
            new THREE.Vector3().subVectors(this.camera.position, wp);
        }
      } else if (planetName === "SATURN") {
        let ringMesh = mesh.getObjectByName("RING");
        if (planetName === this.selectedPlanet) {
          ringMesh.rotation.y = this.planetDragRotY;
          planetMesh.rotation.y = this.planetDragRotY;
          planetMesh.rotation.x = this.planetDragRotX;
        } else {
          ringMesh.rotation.y = elapsedTime * bgSpeed;
          planetMesh.rotation.y = elapsedTime * bgSpeed;
        }
      } else {
        if (planetName === this.selectedPlanet) {
          planetMesh.rotation.y = this.planetDragRotY;
          planetMesh.rotation.x = this.planetDragRotX;
        } else {
          planetMesh.rotation.y = elapsedTime * bgSpeed;
        }
      }

      if (planetName !== "SUN") {
        planetGlowMesh.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(this.camera.position, planetGlowMesh.position);
      }
    }

    // Update uTime + pulsing c on the SUN-GLOW cloned material
    const sunGroup = this.solarSystemMesh.get('SUN');
    if (sunGroup) {
      const sunGlowMesh = sunGroup.getObjectByName('SUN-GLOW') as THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
      if (sunGlowMesh) {
        sunGlowMesh.material.uniforms['uTime'].value = elapsedTime;
        // Organic breathing pulse: corona slightly expands and contracts
        sunGlowMesh.material.uniforms['c'].value = 1.0 + Math.sin(elapsedTime * 1.4) * 0.15;
      }
    }

    this.resetMaterials();
    this.hoverPlanet();
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
        // Inner flame corona (cloned so viewVector is independent per frame)
        const sunGlow = new THREE.Mesh(sphereGeom.clone(), this.sunCustomMaterial.clone());
        sunGlow.position.x = props.positionX;
        sunGlow.name = planetName + "-GLOW";
        sunGlow.scale.multiplyScalar(1.02);

        // Outer soft diffuse corona
        const sunOuterGlow = new THREE.Mesh(
          new THREE.SphereGeometry(props.scale, 32, 32),
          this.sunOuterCorona
        );
        sunOuterGlow.position.x = props.positionX;
        sunOuterGlow.name = planetName + "-OUTER-GLOW";
        sunOuterGlow.scale.multiplyScalar(1.30);

        planetGroup.add(planet);
        planetGroup.add(sunGlow);
        planetGroup.add(sunOuterGlow);
      } else {
        var customMaterial = new THREE.ShaderMaterial({
          uniforms: {
            c: { value: this.defaultGlow },
            p: { value: 6 },
            glowColor: { value: new THREE.Color(props.glowColor) },
            viewVector: { value: this.camera.position },
          },
          vertexShader: planetVertexShader,
          fragmentShader: planetFragmentShader,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
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
      scale: 0.9,
      positionX: -5,
      roughness: 0.4,
      map: this.mercureTexture,
      normalTexture: this.normalTexture,
      glowColor: "#ae9a76",
    };

    // ------------ VENUS ------------
    const VENUS = {
      scale: 1.4,
      positionX: -1,
      roughness: 0.6,
      map: this.venusTexture,
      normalTexture: this.normalTexture,
      glowColor: "#dcb67c",
    };

    // ------------ EARTH ------------
    const EARTH = {
      scale: 1.5,
      positionX: 4,
      roughness: 0.6,
      map: this.earthTexture,
      normalTexture: this.normalTexture,
      glowColor: "#5e6daa",
    };

    // ------------ MARS ------------
    const MARS = {
      scale: 0.8,
      positionX: 8,
      roughness: 0.7,
      map: this.marsTexture,
      normalTexture: this.normalTexture,
      glowColor: "#e3683e",
    };
    // ------------ JUPITER ------------
    const JUPITER = {
      scale: 3.0,
      positionX: 14,
      roughness: 0.8,
      map: this.jupiterTexture,
      normalTexture: this.jupiterNormalTexture,
      glowColor: "#eecbaa",
    };

    // ------------ SATURN ------------
    const SATURN = {
      scale: 1.8,
      positionX: 23,
      roughness: 0.85,
      map: this.saturnTexture,
      normalTexture: this.normalTexture,
      ringScale: 0.45,
      ringMap: this.saturnRingTexture,
      ringRoughness: 0.4,
      ringMetalness: 0.5,
      glowColor: "#ffe786",
    };
    // ------------ URANUS ------------
    const URANUS = {
      scale: 2.0,
      positionX: 32,
      roughness: 0.9,
      map: this.uranusTexture,
      normalTexture: this.uranusNormalTexture,
      glowColor: "#3feee8",
    };
    // ------------ NEPTUNE ------------
    const NEPTUNE = {
      scale: 1.8,
      positionX: 38,
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
      this.clickStartX = event.clientX;
      this.clickStartY = event.clientY;
      this.hasDragged = false;
      // Start planet drag in detail view
      if (this.selectedPlanet && event.target instanceof HTMLCanvasElement) {
        this.planetDragActive = true;
        this.planetDragLastX = event.clientX;
        this.planetDragLastY = event.clientY;
        this.planetDragVelY = 0;
        this.planetDragVelX = 0;
      }
    });

    window.addEventListener("mousemove", (event) => {

      this.mouse.x = ( event.clientX / this.sizes.width ) * 2 - 1;
	    this.mouse.y = - ( event.clientY / this.sizes.height ) * 2 + 1;

      if (!this.mouseDown) {
        return;
      }

      const dx = Math.abs(event.clientX - this.clickStartX);
      const dy = Math.abs(event.clientY - this.clickStartY);
      if (dx > 4 || dy > 4) {
        this.hasDragged = true;
      }

      // Planet rotation drag in detail view
      if (this.selectedPlanet && this.planetDragActive) {
        const dx = event.clientX - this.planetDragLastX;
        const dy = event.clientY - this.planetDragLastY;
        this.planetDragLastX = event.clientX;
        this.planetDragLastY = event.clientY;
        const sens = 0.006;
        this.planetDragRotY += dx * sens;
        this.planetDragRotX += dy * sens;
        this.planetDragVelY = dx * sens;
        this.planetDragVelX = dy * sens;
        this.planetDragUsed = true;
      }

      if (this.selectedPlanet) return;

      event.preventDefault();
      const deltaX = event.clientX / this.sizes.width - this.cursorX;
      this.cursorX = event.clientX / this.sizes.width;
      this.dragAction(-deltaX);
    });

    window.addEventListener("mouseup", (event) => {
      // Only process canvas clicks - ignore clicks on HTML UI elements (buttons, etc.)
      if (!(event.target instanceof HTMLCanvasElement)) {
        this.mouseDown = false;
        this.planetDragActive = false;
        return;
      }
      event.preventDefault();
      this.mouseDown = false;
      this.planetDragActive = false;
      if (!this.hasDragged) {
        this.handleClick();
      }
    });

    // EVENT : controle du 'zoom' avec la roulette ou le double-tap sur smartphone
    window.addEventListener("wheel", (event) => {
      if (this.selectedPlanet) return;
      const delta = Math.sign(event.deltaY);
      this.zoomAction(delta);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === 'ArrowRight') {
        if (this.selectedPlanet) this.navigatePlanet(1);
      } else if (event.key === 'ArrowLeft') {
        if (this.selectedPlanet) this.navigatePlanet(-1);
      } else if (event.key === 'Escape') {
        if (this.selectedPlanet) this.unfocusPlanet();
      }
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

  handleClick(): void {
    this.mouseRayCaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.mouseRayCaster.intersectObjects(this.solarSystemGroup.children, true);

    if (intersects.length === 0) {
      if (this.selectedPlanet) this.unfocusPlanet();
      return;
    }

    for (const intersect of intersects) {
      const mesh = intersect.object as THREE.Mesh;
      let planetName = mesh.name;
      if (planetName.includes('-OUTER-GLOW')) {
        planetName = planetName.replace('-OUTER-GLOW', '');
      } else if (planetName.includes('-GLOW')) {
        planetName = planetName.replace('-GLOW', '');
      }
      if (this.solarSystemProps.has(planetName)) {
        if (this.selectedPlanet === planetName) {
          this.unfocusPlanet();
        } else {
          this.focusPlanet(planetName);
        }
        return;
      }
    }

    if (this.selectedPlanet) this.unfocusPlanet();
  }

  focusPlanet(planetName: string, direction: 1 | -1 = 1): void {
    const props = this.solarSystemProps.get(planetName);
    if (!props) return;

    // Reset the previous planet's Y before switching
    if (this.selectedPlanet) {
      const prevGroup = this.solarSystemMesh.get(this.selectedPlanet);
      if (prevGroup) {
        gsap.killTweensOf(prevGroup.position);
        prevGroup.position.y = 0;
      }
    }

    this.selectedPlanet = planetName;

    // Reset planet drag state for the new selection
    this.planetDragActive = false;
    this.planetDragRotY = 0;
    this.planetDragRotX = 0;
    this.planetDragVelY = 0;
    this.planetDragVelX = 0;
    this.planetDragUsed = false;

    // Hide all planets while we reposition the camera
    for (const [, group] of this.solarSystemMesh.entries()) {
      group.visible = false;
    }

    let effectiveRadius: number;
    if (planetName === 'SUN') {
      effectiveRadius = props.scale * 1.25;
    } else if (planetName === 'SATURN') {
      // frame on sphere + a bit of ring breathing room, not the full ring outer edge
      // so the sphere stays large and prominent
      effectiveRadius = props.scale * 1.1 * 1.4;
    } else {
      effectiveRadius = props.scale * 1.1;
    }
    const targetZ = Math.max(3, effectiveRadius * 4);
    const targetX = props.positionX + targetZ * 0.3;

    // Teleport camera to its final position instantly - no camera animation
    gsap.killTweensOf(this.camera.position);
    this.camera.position.set(targetX, 1, targetZ);

    // direction=1 (right/first): planet rises from below
    // direction=-1 (left): planet falls from above
    const offset = targetZ * 0.5 + effectiveRadius * 1.5;
    const startY = -direction * offset;
    const targetGroup = this.solarSystemMesh.get(planetName);
    if (!targetGroup) return;

    gsap.killTweensOf(targetGroup.position);
    targetGroup.position.y = startY;
    targetGroup.visible = true;

    gsap.to(targetGroup.position, {
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
    });
  }

  unfocusPlanet(): void {
    // Reset the focused planet's Y so it's correct when returning to overview
    if (this.selectedPlanet) {
      const prevGroup = this.solarSystemMesh.get(this.selectedPlanet);
      if (prevGroup) {
        gsap.killTweensOf(prevGroup.position);
        prevGroup.position.y = 0;
      }
    }

    this.selectedPlanet = null;

    // Restore all planet groups
    for (const [, group] of this.solarSystemMesh.entries()) {
      group.visible = true;
    }

    gsap.killTweensOf(this.camera.position);
    gsap.to(this.camera.position, {
      x: 12,
      y: 2,
      z: 30,
      duration: 1.5,
      ease: 'power2.inOut',
    });
  }


  resetMaterials(): void {
    document.body.style.cursor = 'default';
    for(let i = 0; i < this.solarSystemGroup.children.length; i++){
      const planetGroup = this.solarSystemGroup.children[i] as THREE.Mesh

      for(let j = 0; j < planetGroup.children.length; j++){
        const mesh = planetGroup.children[j] as THREE.Mesh
        if(mesh.name.includes('GLOW') && !mesh.name.includes('SUN')){
          const material = mesh.material as THREE.ShaderMaterial
          material.uniforms.c.value = this.defaultGlow
        }
      }
    }
  }


  hoverPlanet() : void {
    if (this.selectedPlanet) {
      document.body.style.cursor = this.planetDragActive ? 'grabbing' : 'grab';
      return;
    }

    this.mouseRayCaster.setFromCamera(this.mouse, this.camera);
    const intersrects = this.mouseRayCaster.intersectObjects(this.solarSystemGroup.children)

    if(intersrects.length === 0){
      return
    }

    for(let i =0; i < intersrects.length; i++){
      const mesh = (intersrects[i].object as THREE.Mesh)
      if(mesh.name.includes('GLOW')){
        document.body.style.cursor = 'pointer';
        if (mesh.name.includes('SUN')) continue; // sun needs no hover boost — avoids double-animation
        const material = mesh.material as THREE.ShaderMaterial
        material.uniforms.c.value = this.hoverGlow
      }
    }
  }

}
