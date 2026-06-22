// Centralized Three.js 3D Rendering System
// Handles the interactive background particle constellation, floating 3D shapes, and the hero 3D neural chip simulation.
// Adapts dynamically to light and dark themes using a MutationObserver.

function initThreeSystem() {
  // --- Textures helper for glowing additive particles ---
  function createParticleTexture(colorGlowRGB = '139, 92, 246', colorOuterRGB = '6, 182, 212') {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, `rgba(${colorGlowRGB}, 0.8)`);
    grad.addColorStop(0.5, `rgba(${colorOuterRGB}, 0.3)`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
  }

  // Global references for theme adaptation
  let bgLineSegments, bgPoints, starfieldPoints, starfieldMaterial;
  let brainPoints, brainLines, chipGrid, mcuBox, dataPackets;
  const activeElectricBolts = [];
  let activeBgCount = 120;
  const maxBgParticles = 600;

  // ==========================================
  // 1. GLOBAL BACKGROUND PARTICLE CONSTELLATION & 3D SHAPES
  // ==========================================
  const bgCanvas = document.getElementById('three-bg-canvas');
  if (bgCanvas) {
    const renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();

    // Camera settings
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;

    // Light sources for metallic/glassy meshes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 1.2); // Cyan light
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xec4899, 1.0); // Pink light
    dirLight2.position.set(-5, -3, 2);
    scene.add(dirLight2);

    // Background Particle Points Setup (Upgraded to dynamic pool for click-added nodes)
    const bgGeometry = new THREE.BufferGeometry();
    const bgPositions = new Float32Array(maxBgParticles * 3);
    const bgVelocities = [];

    for (let i = 0; i < maxBgParticles; i++) {
      if (i < activeBgCount) {
        bgPositions[i * 3] = (Math.random() - 0.5) * 20;
        bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        bgPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

        bgVelocities.push({
          x: (Math.random() - 0.5) * 0.004,
          y: (Math.random() - 0.5) * 0.004,
          z: (Math.random() - 0.5) * 0.004
        });
      } else {
        bgPositions[i * 3] = 0;
        bgPositions[i * 3 + 1] = 0;
        bgPositions[i * 3 + 2] = 0;
        bgVelocities.push({ x: 0, y: 0, z: 0 });
      }
    }

    bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgGeometry.setDrawRange(0, activeBgCount);

    const bgTexture = createParticleTexture('139, 92, 246', '6, 182, 212');
    const bgPointsMaterial = new THREE.PointsMaterial({
      size: 0.15,
      map: bgTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    bgPoints = new THREE.Points(bgGeometry, bgPointsMaterial);
    scene.add(bgPoints);

    // 100,000 (1 Lakh) Background Starfield Setup
    const starfieldCount = 10000;
    const starfieldGeometry = new THREE.BufferGeometry();
    const starfieldPositions = new Float32Array(starfieldCount * 3);

    for (let i = 0; i < starfieldCount; i++) {
      starfieldPositions[i * 3] = (Math.random() - 0.5) * 80;
      starfieldPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      starfieldPositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 15; // Set deep behind foreground layer
    }

    starfieldGeometry.setAttribute('position', new THREE.BufferAttribute(starfieldPositions, 3));

    starfieldMaterial = new THREE.PointsMaterial({
      size: 0.04, // Very tiny stars
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    starfieldPoints = new THREE.Points(starfieldGeometry, starfieldMaterial);
    scene.add(starfieldPoints);

    // Dynamic proximity connection lines
    const maxBgLines = 300;
    const bgLineGeometry = new THREE.BufferGeometry();
    const bgLinePositions = new Float32Array(maxBgLines * 2 * 3);
    bgLineGeometry.setAttribute('position', new THREE.BufferAttribute(bgLinePositions, 3));

    const bgLineMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.04,
      blending: THREE.AdditiveBlending
    });

    bgLineSegments = new THREE.LineSegments(bgLineGeometry, bgLineMaterial);
    scene.add(bgLineSegments);

    // Track mouse influence
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 1.5;
    });

    // Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Generate jagged lightning path coordinates
    function createLightningPath(start, end, segmentsCount = 10, offsetRange = 0.4) {
      const points = [];
      points.push(start.clone());

      const direction = end.clone().sub(start);
      const axis = direction.clone().normalize();

      // Get orthogonal vectors for displacement jitter
      const temp = Math.abs(axis.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const up = new THREE.Vector3().crossVectors(axis, temp).normalize();
      const right = new THREE.Vector3().crossVectors(axis, up).normalize();

      for (let i = 1; i < segmentsCount; i++) {
        const fraction = i / segmentsCount;
        const point = start.clone().lerp(end, fraction);

        const angle = Math.random() * Math.PI * 2;
        const offsetAmt = (Math.random() - 0.5) * offsetRange;
        const displace = up.clone().multiplyScalar(Math.cos(angle) * offsetAmt)
          .add(right.clone().multiplyScalar(Math.sin(angle) * offsetAmt));

        point.add(displace);
        points.push(point);
      }

      points.push(end.clone());
      return points;
    }

    // Spawns a glowing high-voltage electrical discharge between two coordinates
    function spawnElectricity(start, end) {
      const maxLifetime = 12; // flicker duration in frames (about 0.2s)

      const neonColors = [0x06b6d4, 0xec4899, 0x8b5cf6]; // Cyan, Pink, Purple
      const pickedColor = neonColors[Math.floor(Math.random() * neonColors.length)];

      const boltGeometry = new THREE.BufferGeometry();
      const glowGeometry = new THREE.BufferGeometry();

      const pathPoints = createLightningPath(start, end, 10, 0.45);
      const pathPositions = [];
      pathPoints.forEach(pt => {
        pathPositions.push(pt.x, pt.y, pt.z);
      });

      boltGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pathPositions, 3));
      glowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pathPositions, 3));

      const boltMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
      });

      const glowMaterial = new THREE.LineBasicMaterial({
        color: pickedColor,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });

      const boltLine = new THREE.Line(boltGeometry, boltMaterial);
      const glowLine = new THREE.Line(glowGeometry, glowMaterial);

      scene.add(boltLine);
      scene.add(glowLine);

      // Add travelling spark particles along the bolt path
      const sparkCount = 10;
      const sparkGeometry = new THREE.BufferGeometry();
      const sparkPositions = new Float32Array(sparkCount * 3);
      const sparkStates = [];

      for (let i = 0; i < sparkCount; i++) {
        sparkPositions[i * 3] = start.x;
        sparkPositions[i * 3 + 1] = start.y;
        sparkPositions[i * 3 + 2] = start.z;

        sparkStates.push({
          progress: (i / sparkCount) * 0.4, // Stagger sparks along the line
          speed: 0.06 + Math.random() * 0.04
        });
      }

      sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

      const sparkColorString = pickedColor === 0x06b6d4 ? '6, 182, 212' : (pickedColor === 0xec4899 ? '236, 72, 153' : '139, 92, 246');
      const sparkTexture = createParticleTexture(sparkColorString, '255, 255, 255');
      const sparkMaterial = new THREE.PointsMaterial({
        size: 0.16,
        map: sparkTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 1.0
      });

      const sparkPoints = new THREE.Points(sparkGeometry, sparkMaterial);
      scene.add(sparkPoints);

      activeElectricBolts.push({
        start: start,
        end: end,
        color: pickedColor,
        boltLine: boltLine,
        glowLine: glowLine,
        sparkPoints: sparkPoints,
        sparkGeometry: sparkGeometry,
        sparkMaterial: sparkMaterial,
        sparkStates: sparkStates,
        maxLifetime: maxLifetime,
        currentAge: 0
      });
    }

    // Dynamic click listener on window to trigger electricity and constellation stars
    window.addEventListener('click', (event) => {
      if (event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.closest('button') ||
        event.target.closest('.settings-widget') ||
        event.target.closest('.nav-links') ||
        event.target.closest('a')) {
        return;
      }

      const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;
      const clickMouse = new THREE.Vector2(ndcX, ndcY);

      const clickRaycaster = new THREE.Raycaster();
      clickRaycaster.setFromCamera(clickMouse, camera);

      const targetZ = 0;
      const dist = (targetZ - camera.position.z) / clickRaycaster.ray.direction.z;
      const spawnPos = clickRaycaster.ray.origin.clone().add(clickRaycaster.ray.direction.clone().multiplyScalar(dist));

      // Project target coordinate: center of brain canvas on homepage, nearest node on subpages
      let target3DPos = new THREE.Vector3(0, 0, 0);
      const heroCanvasEl = document.getElementById('hero-3d-canvas');

      if (heroCanvasEl) {
        const rect = heroCanvasEl.getBoundingClientRect();
        const screenX = rect.left + rect.width / 2;
        const screenY = rect.top + rect.height / 2;

        const ndcXTarget = (screenX / window.innerWidth) * 2 - 1;
        const ndcYTarget = -(screenY / window.innerHeight) * 2 + 1;
        const targetMouse = new THREE.Vector2(ndcXTarget, ndcYTarget);

        const targetRaycaster = new THREE.Raycaster();
        targetRaycaster.setFromCamera(targetMouse, camera);

        const distTarget = (targetZ - camera.position.z) / targetRaycaster.ray.direction.z;
        target3DPos = targetRaycaster.ray.origin.clone().add(targetRaycaster.ray.direction.clone().multiplyScalar(distTarget));
      } else {
        let closestDist = Infinity;
        let closestIndex = 0;
        const activePos = bgGeometry.attributes.position.array;

        for (let i = 0; i < activeBgCount; i++) {
          const px = activePos[i * 3];
          const py = activePos[i * 3 + 1];
          const pz = activePos[i * 3 + 2];

          const d = spawnPos.distanceTo(new THREE.Vector3(px, py, pz));
          if (d < closestDist) {
            closestDist = d;
            closestIndex = i;
          }
        }

        if (activeBgCount > 0) {
          target3DPos.set(
            activePos[closestIndex * 3],
            activePos[closestIndex * 3 + 1],
            activePos[closestIndex * 3 + 2]
          );
        }
      }

      // 1. Spawning Dynamic Electrical discharge
      spawnElectricity(spawnPos, target3DPos);

      // 2. Add New Nodes to Background Constellation (dynamic particle addition)
      const dotsToSpawn = 2 + Math.floor(Math.random() * 2); // Spawns 2 or 3 dots
      const geomPos = bgGeometry.attributes.position.array;

      for (let d = 0; d < dotsToSpawn; d++) {
        if (activeBgCount < maxBgParticles) {
          const spreadX = (Math.random() - 0.5) * 0.4;
          const spreadY = (Math.random() - 0.5) * 0.4;
          const spreadZ = (Math.random() - 0.5) * 0.4;

          geomPos[activeBgCount * 3] = spawnPos.x + spreadX;
          geomPos[activeBgCount * 3 + 1] = spawnPos.y + spreadY;
          geomPos[activeBgCount * 3 + 2] = spawnPos.z + spreadZ;

          bgVelocities[activeBgCount] = {
            x: (Math.random() - 0.5) * 0.005,
            y: (Math.random() - 0.5) * 0.005,
            z: (Math.random() - 0.5) * 0.005
          };

          activeBgCount++;
        }
      }

      bgGeometry.setDrawRange(0, activeBgCount);
      bgGeometry.attributes.position.needsUpdate = true;
    });

    // Render loop
    function animateBg() {
      requestAnimationFrame(animateBg);

      // Move points
      const pos = bgGeometry.attributes.position.array;
      for (let i = 0; i < activeBgCount; i++) {
        pos[i * 3] += bgVelocities[i].x;
        pos[i * 3 + 1] += bgVelocities[i].y;
        pos[i * 3 + 2] += bgVelocities[i].z;

        // Bounce on borders
        if (Math.abs(pos[i * 3]) > 12) bgVelocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 9) bgVelocities[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 6) bgVelocities[i].z *= -1;
      }
      bgGeometry.attributes.position.needsUpdate = true;

      // Update electricity bolts (crackling & sparks)
      for (let bIdx = activeElectricBolts.length - 1; bIdx >= 0; bIdx--) {
        const bolt = activeElectricBolts[bIdx];
        bolt.currentAge++;

        if (bolt.currentAge >= bolt.maxLifetime) {
          scene.remove(bolt.boltLine);
          scene.remove(bolt.glowLine);
          scene.remove(bolt.sparkPoints);

          bolt.boltLine.geometry.dispose();
          bolt.boltLine.material.dispose();
          bolt.glowLine.geometry.dispose();
          bolt.glowLine.material.dispose();
          bolt.sparkPoints.geometry.dispose();
          bolt.sparkPoints.material.dispose();

          activeElectricBolts.splice(bIdx, 1);
        } else {
          // Re-generate lightning path on every frame to create organic high-voltage flickering
          const newPath = createLightningPath(bolt.start, bolt.end, 10, 0.45);
          const newPositions = [];
          newPath.forEach(pt => {
            newPositions.push(pt.x, pt.y, pt.z);
          });

          bolt.boltLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
          bolt.boltLine.geometry.attributes.position.needsUpdate = true;

          // Jitter the glow line slightly to create double-exposure discharge glow
          const glowPositions = newPositions.map(val => val + (Math.random() - 0.5) * 0.04);
          bolt.glowLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(glowPositions, 3));
          bolt.glowLine.geometry.attributes.position.needsUpdate = true;

          const lifeRatio = 1.0 - (bolt.currentAge / bolt.maxLifetime);
          bolt.boltLine.material.opacity = lifeRatio;
          bolt.glowLine.material.opacity = lifeRatio * 0.6;

          // Animate spark particles along the path
          const sPos = bolt.sparkGeometry.attributes.position.array;
          for (let i = 0; i < bolt.sparkStates.length; i++) {
            const state = bolt.sparkStates[i];
            state.progress += state.speed;
            if (state.progress > 1.0) state.progress = 0;

            const currentSparkPos = bolt.start.clone().lerp(bolt.end, state.progress);
            sPos[i * 3] = currentSparkPos.x;
            sPos[i * 3 + 1] = currentSparkPos.y;
            sPos[i * 3 + 2] = currentSparkPos.z;
          }
          bolt.sparkGeometry.attributes.position.needsUpdate = true;
          bolt.sparkMaterial.opacity = lifeRatio;
        }
      }

      // Update lines dynamically
      let lineCount = 0;
      const lineArray = bgLineGeometry.attributes.position.array;
      for (let i = 0; i < activeBgCount; i++) {
        const x1 = pos[i * 3];
        const y1 = pos[i * 3 + 1];
        const z1 = pos[i * 3 + 2];

        for (let j = i + 1; j < activeBgCount; j++) {
          if (lineCount >= maxBgLines) break;
          const x2 = pos[j * 3];
          const y2 = pos[j * 3 + 1];
          const z2 = pos[j * 3 + 2];

          const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
          if (dist < 2.5) {
            const idx = lineCount * 6;
            lineArray[idx] = x1;
            lineArray[idx + 1] = y1;
            lineArray[idx + 2] = z1;
            lineArray[idx + 3] = x2;
            lineArray[idx + 4] = y2;
            lineArray[idx + 5] = z2;
            lineCount++;
          }
        }
      }
      // Zero out unused buffer space
      for (let k = lineCount * 6; k < maxBgLines * 6; k++) {
        lineArray[k] = 0;
      }
      bgLineGeometry.attributes.position.needsUpdate = true;
      bgLineGeometry.setDrawRange(0, lineCount * 2);

      // Camera parallax scroll and mouse reactivity
      const scrollRatio = parseFloat(document.documentElement.style.getPropertyValue('--scroll-ratio') || '0');
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (mouseY - camera.position.y) * 0.05;
      camera.position.z = 8 + scrollRatio * 2.5;

      // Slow drift rotation of the 100,000 background stars
      if (starfieldPoints) {
        starfieldPoints.rotation.y += 0.0003;
        starfieldPoints.rotation.x += 0.00015;
      }

      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animateBg();
  }

  // ==========================================
  // 2. HERO INTERACTIVE 3D NEURAL BRAIN & CHIP
  // ==========================================
  const heroCanvas = document.getElementById('hero-3d-canvas');
  if (heroCanvas) {
    const parent = heroCanvas.parentElement;
    const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(parent.clientWidth, parent.clientHeight);

    const scene = new THREE.Scene();

    // Camera settings - Adjusted distance & height to prevent grid/model clipping at canvas boundaries
    const camera = new THREE.PerspectiveCamera(45, parent.clientWidth / parent.clientHeight, 0.1, 100);
    camera.position.set(0, 0.8, 6.2);

    // Group to hold everything for easy rotation
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Mathematical Brain Construction
    const brainParticlesCount = 1200;
    const brainGeometry = new THREE.BufferGeometry();
    const brainPositions = new Float32Array(brainParticlesCount * 3);
    const originalBrainPositions = new Float32Array(brainParticlesCount * 3);

    for (let i = 0; i < brainParticlesCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      // Distribute organically with sulci/gyri folding patterns
      const rBase = 1.45;
      const fold1 = Math.sin(theta * 6) * Math.cos(phi * 6) * 0.12;
      const fold2 = Math.sin(theta * 16) * Math.cos(phi * 16) * 0.04;
      const r = rBase + fold1 + fold2;

      let x = r * Math.sin(phi) * Math.cos(theta);
      let y = r * Math.sin(phi) * Math.sin(theta);
      let z = r * Math.cos(phi);

      // Separate brain hemispheres
      const hemisphereGap = 0.08;
      if (x > 0) {
        x += hemisphereGap;
      } else {
        x -= hemisphereGap;
      }

      // Proportions: stretch Z (length), compress X/Y (width/height)
      x *= 0.65;
      y *= 0.72;
      z *= 0.95;

      // Flatten base
      if (y < -0.2) y *= 0.85;

      brainPositions[i * 3] = x;
      brainPositions[i * 3 + 1] = y;
      brainPositions[i * 3 + 2] = z;

      originalBrainPositions[i * 3] = x;
      originalBrainPositions[i * 3 + 1] = y;
      originalBrainPositions[i * 3 + 2] = z;
    }

    brainGeometry.setAttribute('position', new THREE.BufferAttribute(brainPositions, 3));

    // Connect brain nodes with static network paths
    const brainLinesIndices = [];
    const maxConnectionDistance = 0.28;
    for (let i = 0; i < brainParticlesCount; i++) {
      const x1 = brainPositions[i * 3];
      const y1 = brainPositions[i * 3 + 1];
      const z1 = brainPositions[i * 3 + 2];

      let connectionsCount = 0;
      for (let j = i + 1; j < brainParticlesCount; j++) {
        if (connectionsCount >= 2) break; // Limit lines density
        const x2 = brainPositions[j * 3];
        const y2 = brainPositions[j * 3 + 1];
        const z2 = brainPositions[j * 3 + 2];

        const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
        if (dist < maxConnectionDistance) {
          brainLinesIndices.push(i, j);
          connectionsCount++;
        }
      }
    }
    brainGeometry.setIndex(brainLinesIndices);

    // Brain material styles
    const brainPointsTexture = createParticleTexture('139, 92, 246', '236, 72, 153');
    const brainPointsMaterial = new THREE.PointsMaterial({
      size: 0.075,
      map: brainPointsTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const brainLinesMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });

    brainPoints = new THREE.Points(brainGeometry, brainPointsMaterial);
    brainLines = new THREE.LineSegments(brainGeometry, brainLinesMaterial);

    modelGroup.add(brainPoints);
    modelGroup.add(brainLines);

    // 3. SILICON MICROCHIP BOARD (Plane grid under the brain)
    const chipGridSize = 3.6;
    const gridRes = 14;
    const chipLinePositions = [];

    for (let i = 0; i <= gridRes; i++) {
      const coord = (i / gridRes - 0.5) * chipGridSize;
      // Horizontal traces
      chipLinePositions.push(-chipGridSize / 2, -1.3, coord);
      chipLinePositions.push(chipGridSize / 2, -1.3, coord);
      // Vertical traces
      chipLinePositions.push(coord, -1.3, -chipGridSize / 2);
      chipLinePositions.push(coord, -1.3, chipGridSize / 2);
    }

    const chipGeometry = new THREE.BufferGeometry();
    chipGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(chipLinePositions), 3));

    const chipMaterial = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending
    });

    chipGrid = new THREE.LineSegments(chipGeometry, chipMaterial);
    modelGroup.add(chipGrid);

    // Glowing Central Microcontroller Block (Square in center)
    const mcuSize = 0.8;
    const mcuPositions = [
      -mcuSize / 2, -1.29, -mcuSize / 2, mcuSize / 2, -1.29, -mcuSize / 2,
      mcuSize / 2, -1.29, -mcuSize / 2, mcuSize / 2, -1.29, mcuSize / 2,
      mcuSize / 2, -1.29, mcuSize / 2, -mcuSize / 2, -1.29, mcuSize / 2,
      -mcuSize / 2, -1.29, mcuSize / 2, -mcuSize / 2, -1.29, -mcuSize / 2
    ];
    const mcuGeometry = new THREE.BufferGeometry();
    mcuGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mcuPositions), 3));
    const mcuMaterial = new THREE.LineBasicMaterial({
      color: 0xec4899,
      linewidth: 2,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    mcuBox = new THREE.LineSegments(mcuGeometry, mcuMaterial);
    modelGroup.add(mcuBox);

    // 4. FLOATING CIRCUIT PACKETS (Rising from chip nodes to neural network)
    const packetsCount = 45;
    const packetsPositions = new Float32Array(packetsCount * 3);
    const packetsGeometry = new THREE.BufferGeometry();
    const packetStates = [];

    for (let i = 0; i < packetsCount; i++) {
      // Pick a random grid junction on the chip plane
      const gridXIndex = Math.floor(Math.random() * (gridRes + 1));
      const gridZIndex = Math.floor(Math.random() * (gridRes + 1));
      const startX = (gridXIndex / gridRes - 0.5) * chipGridSize;
      const startZ = (gridZIndex / gridRes - 0.5) * chipGridSize;

      packetsPositions[i * 3] = startX;
      packetsPositions[i * 3 + 1] = -1.3;
      packetsPositions[i * 3 + 2] = startZ;

      packetStates.push({
        startX: startX,
        startZ: startZ,
        progress: Math.random(), // Offset initial progress randomly
        speed: 0.005 + Math.random() * 0.008,
        targetNode: Math.floor(Math.random() * brainParticlesCount)
      });
    }

    packetsGeometry.setAttribute('position', new THREE.BufferAttribute(packetsPositions, 3));
    const packetTexture = createParticleTexture('6, 182, 212', '255, 255, 255');
    const packetsMaterial = new THREE.PointsMaterial({
      size: 0.12,
      map: packetTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    dataPackets = new THREE.Points(packetsGeometry, packetsMaterial);
    modelGroup.add(dataPackets);

    // Interactivity
    let targetRotationX = 0.25;
    let targetRotationY = -0.5;
    let mousePos = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
      // Relative mouse offset based on page location
      const rect = parent.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;

      mousePos.x = cx / rect.width;
      mousePos.y = cy / rect.height;

      // Adjust model rotation slightly following mouse
      targetRotationY = -0.5 + mousePos.x * 0.9;
      targetRotationX = 0.25 + mousePos.y * 0.6;
    });

    // Resize Handler
    window.addEventListener('resize', () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // Performance loop hook
    let isHeroVisible = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isHeroVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(heroCanvas);

    let time = 0;
    function animateHero() {
      requestAnimationFrame(animateHero);

      if (!isHeroVisible) return; // Halt loop if offscreen

      time += 0.008;

      // Rotate group smoothly
      modelGroup.rotation.y += (targetRotationY - modelGroup.rotation.y) * 0.05;
      modelGroup.rotation.x += (targetRotationX - modelGroup.rotation.x) * 0.05;

      // Idle circular wobble
      modelGroup.position.y = Math.sin(time) * 0.08;

      // Update data packet trajectories
      const packPos = dataPackets.geometry.attributes.position.array;
      for (let i = 0; i < packetsCount; i++) {
        const state = packetStates[i];
        state.progress += state.speed;

        if (state.progress >= 1.0) {
          // Reset packet back to a random chip junction
          const gridXIndex = Math.floor(Math.random() * (gridRes + 1));
          const gridZIndex = Math.floor(Math.random() * (gridRes + 1));
          state.startX = (gridXIndex / gridRes - 0.5) * chipGridSize;
          state.startZ = (gridZIndex / gridRes - 0.5) * chipGridSize;
          state.progress = 0;
          state.targetNode = Math.floor(Math.random() * brainParticlesCount);
          packPos[i * 3] = state.startX;
          packPos[i * 3 + 1] = -1.3;
          packPos[i * 3 + 2] = state.startZ;
        } else {
          // Lerp coordinates: start at chip plane junction -> travel to target node in brain
          const targetNodeIdx = state.targetNode;
          const endX = brainPositions[targetNodeIdx * 3];
          const endY = brainPositions[targetNodeIdx * 3 + 1];
          const endZ = brainPositions[targetNodeIdx * 3 + 2];

          // Linear interpolation path with slight curves
          packPos[i * 3] = THREE.MathUtils.lerp(state.startX, endX, state.progress);
          // Vertical rise curve
          packPos[i * 3 + 1] = THREE.MathUtils.lerp(-1.3, endY, state.progress) + Math.sin(state.progress * Math.PI) * 0.15;
          packPos[i * 3 + 2] = THREE.MathUtils.lerp(state.startZ, endZ, state.progress);
        }
      }
      dataPackets.geometry.attributes.position.needsUpdate = true;

      // Add an organic breathing swell to the brain particles
      const brainPos = brainGeometry.attributes.position.array;
      for (let i = 0; i < brainParticlesCount; i++) {
        const ox = originalBrainPositions[i * 3];
        const oy = originalBrainPositions[i * 3 + 1];
        const oz = originalBrainPositions[i * 3 + 2];

        // Push and pull vertices based on sine wave
        const factor = 1.0 + Math.sin(time * 2.5 + ox * 3 + oy * 3) * 0.025;

        brainPos[i * 3] = ox * factor;
        brainPos[i * 3 + 1] = oy * factor;
        brainPos[i * 3 + 2] = oz * factor;
      }
      brainGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animateHero();
  }

  // ==========================================
  // 3. DYNAMIC LIGHT/DARK THEME ADAPTATION
  // ==========================================
  function updateThreeTheme(theme) {
    const isLight = theme === 'light';

    // Background dynamic lines & points adjustments
    if (bgLineSegments) {
      bgLineSegments.material.color.setHex(isLight ? 0x6d28d9 : 0x8b5cf6);
      bgLineSegments.material.opacity = isLight ? 0.08 : 0.04;
      bgLineSegments.material.needsUpdate = true;
    }
    if (bgPoints) {
      const glow = isLight ? '109, 40, 217' : '139, 92, 246';
      const outer = isLight ? '13, 148, 136' : '6, 182, 212';
      bgPoints.material.map = createParticleTexture(glow, outer);
      bgPoints.material.size = isLight ? 0.15 : 0.12; // Adjusted size for elegance
      bgPoints.material.needsUpdate = true;
    }

    if (starfieldMaterial) {
      starfieldMaterial.color.setHex(isLight ? 0x8b5cf6 : 0xffffff); // Purple in light theme, white in dark
      starfieldMaterial.opacity = isLight ? 0.08 : 0.25; // Soften in light mode
      starfieldMaterial.needsUpdate = true;
    }

    // Hero Brain Model dynamic adjustments
    if (brainPoints) {
      const glow = isLight ? '109, 40, 217' : '139, 92, 246'; // Deep violet vs bright purple
      const outer = isLight ? '219, 39, 119' : '236, 72, 153'; // Deep pink vs neon pink
      brainPoints.material.map = createParticleTexture(glow, outer);
      brainPoints.material.size = isLight ? 0.10 : 0.075; // Fatter particles in light mode
      brainPoints.material.needsUpdate = true;
    }
    if (brainLines) {
      brainLines.material.color.setHex(isLight ? 0x6d28d9 : 0x8b5cf6);
      brainLines.material.opacity = isLight ? 0.26 : 0.12; // Higher contrast lines
      brainLines.material.needsUpdate = true;
    }
    if (chipGrid) {
      chipGrid.material.color.setHex(isLight ? 0x0891b2 : 0x06b6d4); // Darker cyan vs light neon cyan
      chipGrid.material.opacity = isLight ? 0.40 : 0.22;
      chipGrid.material.needsUpdate = true;
    }
    if (mcuBox) {
      mcuBox.material.color.setHex(isLight ? 0xdb2777 : 0xec4899);
      mcuBox.material.opacity = isLight ? 0.85 : 0.65;
      mcuBox.material.needsUpdate = true;
    }
    if (dataPackets) {
      const glow = isLight ? '3, 105, 120' : '6, 182, 212';
      dataPackets.material.map = createParticleTexture(glow, '15, 23, 42'); // Dark tail on packets in light mode
      dataPackets.material.size = isLight ? 0.16 : 0.12;
      dataPackets.material.needsUpdate = true;
    }
  }

  // Set initial theme setup
  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateThreeTheme(initialTheme);

  // Monitor document HTML node attributes for theme switches
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        updateThreeTheme(activeTheme);
      }
    });
  });
  themeObserver.observe(document.documentElement, { attributes: true });
}

// Robust execution wrapper
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThreeSystem);
} else {
  initThreeSystem();
}
