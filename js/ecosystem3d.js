/**
 * HIERO Bridge — 3D Spatial Ecosystem Visualization
 * Built with Three.js / WebGL
 * Visualizes the Academia ↔ Talent ↔ Industry interconnected placement matrix.
 */

window.hieroEcosystem3D = (function () {
  let scene, camera, renderer, animationFrameId;
  let nodes = [];
  let connectionLines = [];
  let particlesGroup;
  let raycaster, mouse;
  let containerElement = null;
  let tooltipElement = null;
  let hoveredNode = null;
  let isRotating = true;
  let isInitialized = false;

  // Node Specifications
  const NODE_CONFIG = [
    {
      id: 'academia',
      name: 'Academia Hub',
      subtext: 'NIT Warangal • 2022-2026 Batch',
      category: 'ACADEMIA',
      color: 0x10b981,
      glowColor: 0x34d399,
      size: 1.8,
      position: { x: -6, y: 1.2, z: 0 },
      details: {
        'Verified Students': '20 Candidates',
        'Academic Depts': '5 Branches (CSE, AIML, IT, ECE, MECH)',
        'Average CGPA': '8.37 / 10.0',
        'Verification Status': '100% Institutional Locked'
      }
    },
    {
      id: 'talent',
      name: 'Talent Intelligence Core',
      subtext: 'Pre-Screened Final-Year Pool',
      category: 'TALENT',
      color: 0x00ff87,
      glowColor: 0x6ee7b7,
      size: 2.3,
      position: { x: 0, y: -0.5, z: 2 },
      details: {
        'Placement Readiness': '94% Drive Ready',
        'Verified Projects': '48 Built & Tested',
        'Top Skill Clusters': 'Distributed Systems, AI/ML, Cloud',
        'Active Applications': '4 In Pipeline'
      }
    },
    {
      id: 'industry',
      name: 'Industry Gateway',
      subtext: 'HIERO Connect Recruiter Network',
      category: 'INDUSTRY',
      color: 0x06b6d4,
      glowColor: 0x38bdf8,
      size: 1.9,
      position: { x: 6, y: 1.8, z: -1 },
      details: {
        'Live Enterprise Drives': '3 Campus Drives',
        'Top Hiring Partners': 'Databricks, Microsoft, AWS',
        'Max Compensation': '₹34,00,000 PA',
        'Shortlist Package Status': 'Direct Recruiter Transmit'
      }
    },
    // Satellite Department Nodes
    {
      id: 'dept_cse',
      name: 'Dept: Computer Science',
      subtext: '140 Students • 8.85 Avg CGPA',
      category: 'DEPARTMENT',
      color: 0x059669,
      glowColor: 0x10b981,
      size: 0.9,
      position: { x: -8, y: -2.2, z: -1.5 },
      details: { 'Branch': 'CSE', 'Focus': 'Distributed Systems, Go, OS' }
    },
    {
      id: 'dept_aiml',
      name: 'Dept: AI & ML',
      subtext: '75 Students • 9.20 Avg CGPA',
      category: 'DEPARTMENT',
      color: 0x059669,
      glowColor: 0x10b981,
      size: 0.9,
      position: { x: -4.5, y: -3.5, z: 1.5 },
      details: { 'Branch': 'AIML', 'Focus': 'PyTorch, Vision, NLP' }
    },
    // Satellite Company Nodes
    {
      id: 'comp_databricks',
      name: 'Databricks',
      subtext: 'SDE Distributed Systems • ₹34 LPA',
      category: 'OPPORTUNITY',
      color: 0x0284c7,
      glowColor: 0x38bdf8,
      size: 1.1,
      position: { x: 7.5, y: 4.2, z: 1 },
      details: { 'Role': 'SDE-1 Distributed Systems', 'Openings': '8 Positions', 'Min CGPA': '8.50' }
    },
    {
      id: 'comp_microsoft',
      name: 'Microsoft',
      subtext: 'Cloud & AI Engineer • ₹28 LPA',
      category: 'OPPORTUNITY',
      color: 0x0284c7,
      glowColor: 0x38bdf8,
      size: 1.1,
      position: { x: 9.2, y: 0.5, z: -2.5 },
      details: { 'Role': 'Azure AI Solutions Engineer', 'Openings': '12 Positions', 'Min CGPA': '8.00' }
    },
    {
      id: 'comp_aws',
      name: 'Amazon AWS',
      subtext: 'Backend Infrastructure • ₹26 LPA',
      category: 'OPPORTUNITY',
      color: 0xf59e0b,
      glowColor: 0xfbbf24,
      size: 1.0,
      position: { x: 5.5, y: -2.8, z: -0.5 },
      details: { 'Role': 'SDE-1 Microservices', 'Openings': '15 Positions', 'Min CGPA': '8.00' }
    }
  ];

  const CONNECTIONS = [
    ['academia', 'talent'],
    ['talent', 'industry'],
    ['academia', 'dept_cse'],
    ['academia', 'dept_aiml'],
    ['industry', 'comp_databricks'],
    ['industry', 'comp_microsoft'],
    ['industry', 'comp_aws'],
    ['talent', 'comp_databricks'],
    ['talent', 'comp_microsoft']
  ];

  function init(containerId, options = {}) {
    if (!window.THREE) {
      console.warn('Three.js not loaded, skipping 3D initialization');
      return;
    }

    containerElement = document.getElementById(containerId);
    if (!containerElement) return;

    // Clean up previous instance if any
    destroy();

    const width = containerElement.clientWidth || 800;
    const height = containerElement.clientHeight || (options.height || 360);

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020604, 0.04);

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 18);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerElement.appendChild(renderer.domElement);

    // Raycaster & Mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x064e3b, 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00ff87, 2.2);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.8);
    dirLight2.position.set(-15, -10, -10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x10b981, 2.5, 50);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Create 3D Nodes
    createNodes();

    // Create Curved Connection Conduits
    createConnections();

    // Create Ambient Floating Particle Field
    createParticleField();

    // Create DOM Tooltip
    createTooltip();

    // Event Listeners
    setupEvents();

    isInitialized = true;
    animate();
  }

  function createNodes() {
    nodes = [];

    NODE_CONFIG.forEach(cfg => {
      const group = new THREE.Group();
      group.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
      group.userData = cfg;

      // 1. Core Sphere
      const sphereGeo = new THREE.SphereGeometry(cfg.size * 0.7, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.35,
        roughness: 0.25,
        metalness: 0.8
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(sphere);

      // 2. Outer Wireframe Halo Ring / Organic Cage
      const ringGeo = new THREE.IcosahedronGeometry(cfg.size * 0.95, 1);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cfg.glowColor,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.name = 'halo';
      group.add(ring);

      // 3. Ambient Glow Sprite
      const spriteMat = new THREE.SpriteMaterial({
        color: cfg.glowColor,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(cfg.size * 3.5, cfg.size * 3.5, 1);
      group.add(sprite);

      scene.add(group);
      nodes.push(group);
    });
  }

  function createConnections() {
    connectionLines = [];

    CONNECTIONS.forEach(([fromId, toId]) => {
      const fromNode = nodes.find(n => n.userData.id === fromId);
      const toNode = nodes.find(n => n.userData.id === toId);

      if (fromNode && toNode) {
        const start = fromNode.position;
        const end = toNode.position;

        // Quadratic Bezier curve with elevation
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        mid.y += 1.2;
        mid.z += 1.0;

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(40);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const material = new THREE.LineBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.35,
          linewidth: 1
        });

        const line = new THREE.Line(geometry, material);
        scene.add(line);
        connectionLines.push({ line, curve });
      }
    });
  }

  function createParticleField() {
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(0x00ff87);
    const altColor = new THREE.Color(0x06b6d4);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const mixed = Math.random() > 0.5 ? baseColor : altColor;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    particlesGroup = new THREE.Points(geometry, material);
    scene.add(particlesGroup);
  }

  function createTooltip() {
    if (document.getElementById('ecosystem-3d-tooltip')) {
      tooltipElement = document.getElementById('ecosystem-3d-tooltip');
      return;
    }

    tooltipElement = document.createElement('div');
    tooltipElement.id = 'ecosystem-3d-tooltip';
    tooltipElement.className = 'spatial-3d-tooltip';
    tooltipElement.style.display = 'none';
    document.body.appendChild(tooltipElement);
  }

  function setupEvents() {
    if (!containerElement) return;

    containerElement.addEventListener('mousemove', onMouseMove);
    containerElement.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onWindowResize);
  }

  function onMouseMove(event) {
    const rect = containerElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes.map(n => n.children[0]));

    if (intersects.length > 0) {
      const hitGroup = intersects[0].object.parent;
      if (hitGroup && hitGroup.userData) {
        hoveredNode = hitGroup;
        showTooltip(event.clientX, event.clientY, hitGroup.userData);
        document.body.style.cursor = 'pointer';
        return;
      }
    }

    hoveredNode = null;
    hideTooltip();
    document.body.style.cursor = 'default';
  }

  function onMouseLeave() {
    hoveredNode = null;
    hideTooltip();
  }

  function showTooltip(x, y, data) {
    if (!tooltipElement) return;

    let detailsHtml = '';
    if (data.details) {
      detailsHtml = Object.entries(data.details).map(([k, v]) => `
        <div class="tooltip-detail-row">
          <span class="tooltip-detail-key">${k}:</span>
          <strong class="tooltip-detail-val">${v}</strong>
        </div>
      `).join('');
    }

    tooltipElement.innerHTML = `
      <div class="tooltip-header">
        <span class="tooltip-category-tag tag-${data.category.toLowerCase()}">${data.category}</span>
        <div class="tooltip-title">${data.name}</div>
        <div class="tooltip-subtext">${data.subtext}</div>
      </div>
      <div class="tooltip-body">
        ${detailsHtml}
      </div>
    `;

    tooltipElement.style.display = 'block';
    tooltipElement.style.left = `${x + 16}px`;
    tooltipElement.style.top = `${y - 20}px`;
  }

  function hideTooltip() {
    if (tooltipElement) {
      tooltipElement.style.display = 'none';
    }
  }

  function onWindowResize() {
    if (!containerElement || !renderer || !camera) return;
    const width = containerElement.clientWidth || 800;
    const height = containerElement.clientHeight || 360;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Gentle orbital motion
    if (isRotating && scene) {
      scene.rotation.y = Math.sin(time * 0.15) * 0.18;
      scene.rotation.x = Math.cos(time * 0.12) * 0.06;
    }

    // Node breathing & halo rotation
    nodes.forEach((node, i) => {
      const halo = node.getObjectByName('halo');
      if (halo) {
        halo.rotation.x += 0.008;
        halo.rotation.y += 0.012;
      }

      // Gentle floating elevation
      node.position.y += Math.sin(time * 1.5 + i) * 0.0025;

      if (node === hoveredNode) {
        node.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.15);
      } else {
        node.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    });

    // Particle field slow drift
    if (particlesGroup) {
      particlesGroup.rotation.y = time * 0.03;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function destroy() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (renderer && renderer.domElement && containerElement) {
      try {
        containerElement.removeChild(renderer.domElement);
      } catch (e) {}
    }
    if (tooltipElement && tooltipElement.parentNode) {
      tooltipElement.parentNode.removeChild(tooltipElement);
      tooltipElement = null;
    }
    nodes = [];
    connectionLines = [];
    isInitialized = false;
  }

  return {
    init,
    destroy,
    toggleRotation: () => { isRotating = !isRotating; return isRotating; },
    isLoaded: () => isInitialized
  };
})();
