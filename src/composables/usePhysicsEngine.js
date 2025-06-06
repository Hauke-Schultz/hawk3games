import { ref, onUnmounted } from 'vue'
import Matter from 'matter-js'
import { PHYSICS_CONFIG } from '../config/fruitMergeGameConfig.js'

export function usePhysicsEngine() {
	// Physics state
	const engine = ref(null)
	const world = ref(null)
	const walls = ref([])
	const runner = ref(null)

	// Physics initialization
	const initializePhysics = () => {
		console.log('🎯 Initializing Matter.js physics engine (headless)')

		// Create engine without render
		engine.value = Matter.Engine.create()
		world.value = engine.value.world
		engine.value.world.gravity.y = 0.8
		engine.value.world.gravity.x = 0
		engine.value.velocityIterations = 4
		engine.value.positionIterations = 6
		engine.value.constraintIterations = 2
		engine.value.enableSleeping = true


		// Create boundaries (walls and floor)
		createWorldBoundaries()

		// Start physics loop
		startPhysicsLoop()

		console.log('✅ Physics engine initialized successfully')
	}

	const createWorldBoundaries = () => {
		const { width, height } = PHYSICS_CONFIG.canvas

		// Create static walls
		const leftWall = Matter.Bodies.rectangle(-5, height/2, 10, height, { isStatic: true })
		const rightWall = Matter.Bodies.rectangle(width + 5, height/2, 10, height, { isStatic: true })
		const floor = Matter.Bodies.rectangle(width/2, height + 5, width, 10, { isStatic: true })

		walls.value = [leftWall, rightWall, floor]

		// Add walls to world
		Matter.World.add(world.value, walls.value)

		console.log('🏗️ World boundaries created')
	}

	const startPhysicsLoop = () => {
		runner.value = Matter.Runner.create()
		Matter.Runner.run(runner.value, engine.value)

		console.log('🔄 Physics loop started')
	}

	// Body creation helpers
	const createFruitBody = (x, y, radius, fruitId, fruitType) => {
		return Matter.Bodies.circle(x, y, radius, {
			restitution: 0.3,
			friction: 0.4,
			density: 0.001,
			frictionAir: 0.01,
			label: `fruit_${fruitId}`,
			fruitType: fruitType
		})
	}

	const addBodyToWorld = (body) => {
		if (world.value) {
			Matter.World.add(world.value, body)
			return true
		}
		return false
	}

	const removeBodyFromWorld = (body) => {
		if (world.value && body) {
			Matter.Composite.remove(world.value, body)
			return true
		}
		return false
	}

	// Event handling
	const setupCollisionEvents = (collisionHandler) => {
		if (!engine.value) return

		Matter.Events.on(engine.value, 'collisionStart', collisionHandler)
		console.log('👂 Collision events setup')
	}

	const removeCollisionEvents = () => {
		if (engine.value) {
			Matter.Events.off(engine.value, 'collisionStart')
		}
	}

	// Cleanup
	const cleanupPhysics = () => {
		console.log('🧹 Cleaning up physics engine')

		// Stop runner
		if (runner.value) {
			Matter.Runner.stop(runner.value)
			runner.value = null
		}

		// Clear world
		if (world.value) {
			Matter.World.clear(world.value)
			world.value = null
		}

		// Clear engine
		if (engine.value) {
			Matter.Engine.clear(engine.value)
			engine.value = null
		}

		walls.value = []
	}

	const applyRotationImpulse = (body, force) => {
		const impulse = (Math.random() - 0.5) * force * 0.01
		Matter.Body.setAngularVelocity(body, body.angularVelocity + impulse)
	}

	const getCollisionForce = (collision) => {
		return Matter.Vector.magnitude(collision.normal)
	}

	// Auto-cleanup on unmount
	onUnmounted(() => {
		cleanupPhysics()
	})

	return {
		// State
		engine,
		world,
		walls,
		runner,

		// Initialization
		initializePhysics,
		createWorldBoundaries,
		startPhysicsLoop,
		cleanupPhysics,

		// Body management
		createFruitBody,
		addBodyToWorld,
		removeBodyFromWorld,

		applyRotationImpulse,
		getCollisionForce,

		// Event handling
		setupCollisionEvents,
		removeCollisionEvents
	}
}