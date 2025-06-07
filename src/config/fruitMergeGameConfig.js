
// Physics configuration
export const PHYSICS_CONFIG = {
	canvas: {
		width: 300,
		height: 400
	},
	dropZone: {
		minX: 25,
		maxX: 275,
		dropY: 30
	},
	dropCooldown: 500, // Milliseconds between drops
	gameOverHeight: 320, // Height at which game is over
	warningZone: 30
}

// Fruit Configuration System
export const FRUIT_TYPES = {
	BLUEBERRY: {
		id: 1,
		emoji: '🫐',
		radius: 15,
		nextType: 'STRAWBERRY',
		color: '#4c6ef5',
		scoreValue: 10,
		gradient: ['#748ffc', '#4c6ef5', '#364fc7'],
		shadow: '0 2px 8px rgba(54, 79, 199, 0.4)',
		glowColor: 'rgba(76, 110, 245, 0.6)',
		sparkleColor: '#c5dbff',
		svg: `src/assets/icons/fruits/blueberry.svg`
	},
	STRAWBERRY: {
		id: 2,
		emoji: '🍓',
		radius: 20,
		nextType: 'GRAPE',
		color: '#ff8787',
		scoreValue: 25,
		gradient: ['#ffab91', '#ff8787', '#f4511e'],
		shadow: '0 2px 8px rgba(244, 81, 30, 0.4)',
		glowColor: 'rgba(255, 135, 135, 0.6)',
		sparkleColor: '#ffccbc',
		svg: `src/assets/icons/fruits/strawberry.svg`
	},
	GRAPE: {
		id: 3,
		emoji: '🍇',
		radius: 24,
		nextType: 'ORANGE',
		color: '#845ec2',
		scoreValue: 50,
		gradient: ['#b39ddb', '#845ec2', '#5e35b1'],
		shadow: '0 2px 8px rgba(94, 53, 177, 0.4)',
		glowColor: 'rgba(132, 94, 194, 0.6)',
		sparkleColor: '#d1c4e9',
		svg: `src/assets/icons/fruits/grape.svg`
	},
	ORANGE: {
		id: 4,
		emoji: '🍊',
		radius: 30,
		nextType: 'APPLE',
		color: '#ffa726',
		scoreValue: 100,
		gradient: ['#ffcc02', '#ffa726', '#ff9800'],
		shadow: '0 2px 8px rgba(255, 152, 0, 0.4)',
		glowColor: 'rgba(255, 167, 38, 0.6)',
		sparkleColor: '#ffe0b2',
		svg: `src/assets/icons/fruits/orange.svg`
	},
	APPLE: {
		id: 5,
		emoji: '🍎',
		radius: 40,
		nextType: 'PEACH',
		color: '#e53e3e',
		scoreValue: 200,
		gradient: ['#ef5350', '#e53e3e', '#c62828'],
		shadow: '0 3px 12px rgba(198, 40, 40, 0.5)',
		glowColor: 'rgba(229, 62, 62, 0.7)',
		sparkleColor: '#ffcdd2',
		svg: `src/assets/icons/fruits/apple.svg`
	},
	PEACH: {
		id: 6,
		emoji: '🍑',
		radius: 52,
		nextType: 'PINEAPPLE',
		color: '#ff7043',
		scoreValue: 400,
		gradient: ['#ffab91', '#ff7043', '#d84315'],
		shadow: '0 3px 12px rgba(216, 158, 46, 0.5)',
		glowColor: 'rgba(255, 112, 67, 0.7)',
		sparkleColor: '#ffccbc',
		svg: `src/assets/icons/fruits/peach.svg`
	},
	PINEAPPLE: {
		id: 7,
		emoji: '🍍',
		radius: 68,
		nextType: 'MELON',
		color: '#d69e2e',
		scoreValue: 800,
		gradient: ['#ffd54f', '#d69e2e', '#f57f17'],
		shadow: '0 4px 16px rgba(245, 127, 23, 0.6)',
		glowColor: 'rgba(214, 158, 46, 0.8)',
		sparkleColor: '#fff9c4',
		svg: `src/assets/icons/fruits/pineapple.svg`
	},
	MELON: {
		id: 8,
		emoji: '🍉',
		radius: 82,
		nextType: 'COCONUT',
		color: '#38b2ac',
		scoreValue: 1600,
		gradient: ['#4db6ac', '#38b2ac', '#00695c'],
		shadow: '0 4px 16px rgba(0, 105, 92, 0.6)',
		glowColor: 'rgba(56, 178, 172, 0.8)',
		sparkleColor: '#b2dfdb',
		svg: `src/assets/icons/fruits/melon.svg`
	},
	COCONUT: {
		id: 9,
		emoji: '🥥',
		radius: 98,
		nextType: null,
		color: '#8b4513',
		scoreValue: 3200,
		gradient: ['#a1887f', '#8b4513', '#5d4037'],
		shadow: '0 5px 20px rgba(93, 64, 55, 0.7)',
		glowColor: 'rgba(139, 69, 19, 0.9)',
		sparkleColor: '#d7ccc8',
		svg: `src/assets/icons/fruits/coconut.svg`
	}
}

// Fruit spawning probability (for random drops)
export const FRUIT_SPAWN_WEIGHTS = {
	BLUEBERRY: 0.4,    // 40% chance
	STRAWBERRY: 0.3,   // 30% chance
	GRAPE: 0.2,        // 20% chance
	ORANGE: 0.1        // 10% chance
	// Higher fruits only through merging
}

// Combo configuration
export const COMBO_CONFIG = {
	resetDelay: 6000,
	minComboForDisplay: 1,
	scoreMultipliers: {
		1: 1.0,   // Single merge
		2: 1.2,   // 2x combo = 20% bonus
		3: 1.5,   // 3x combo = 50% bonus
		4: 1.8,   // 4x combo = 80% bonus
		5: 2.0,   // 5x combo = 100% bonus
		6: 2.2,   // 6x combo = 120% bonus
		7: 2.5,   // 7x combo = 150% bonus
		8: 2.8,   // 8x combo = 180% bonus
		9: 3.0,   // 9x combo = 200% bonus
		10: 3.5   // 10+ combo = 250% bonus
	},
	comboMessage: {
		2: 'Nice Combo!',
		3: 'Great Combo!',
		4: 'Awesome Combo!',
		5: 'Amazing Combo!',
		7: 'Incredible Combo!',
		10: 'LEGENDARY COMBO!'
	},
	comboColor: {
		2: '#fdcb6e',  // Yellow
		3: '#e17055',  // Orange
		4: '#e84393',  // Pink
		5: '#a29bfe',  // Purple
		6: '#6c5ce7',  // Deep purple
		7: '#fd79a8',  // Hot pink
		8: '#e84393',  // Magenta
		9: '#9b59b6',  // Royal purple
		10: '#8e44ad' // Deep purple
	}
}

// Level Goal Configuration
export const LEVEL_GOALS = {
	1: {
		targetScore: 200,
		maxMoves: 25,
		gameOverHeight: 320,
		timeLimit: null, // null = unbegrenzt
		description: "Erreiche 200 Punkte",
		starThresholds: {
			1: { score: 200, moves: 14, time: null },
			2: { score: 200, moves: 12, time: null },
			3: { score: 200, moves: 10, time: null }
		}
	},
	2: {
		targetScore: 800,
		maxMoves: 30,
		gameOverHeight: 100,
		timeLimit: null,
		description: "Erreiche 800 Punkte",
		starThresholds: {
			1: { score: 800, moves: 30, time: null },
			2: { score: 1100, moves: 25, time: null },
			3: { score: 1500, moves: 20, time: null }
		}
	},
	3: {
		targetScore: 1200,
		maxMoves: 35,
		gameOverHeight: 100,
		timeLimit: null,
		description: "Erreiche 1200 Punkte",
		starThresholds: {
			1: { score: 1200, moves: 35, time: null },
			2: { score: 1600, moves: 30, time: null },
			3: { score: 2100, moves: 25, time: null }
		}
	},
	4: {
		targetScore: 1800,
		maxMoves: 40,
		gameOverHeight: 100,
		timeLimit: null,
		description: "Erreiche 1800 Punkte",
		starThresholds: {
			1: { score: 1800, moves: 40, time: null },
			2: { score: 2400, moves: 35, time: null },
			3: { score: 3200, moves: 30, time: null }
		}
	},
	5: {
		targetScore: 2500,
		maxMoves: 45,
		gameOverHeight: 100,
		timeLimit: null,
		description: "Erreiche 2500 Punkte",
		starThresholds: {
			1: { score: 2500, moves: 45, time: null },
			2: { score: 3300, moves: 40, time: null },
			3: { score: 4500, moves: 35, time: null }
		}
	},
	6: {
		targetScore: 35000,
		maxMoves: 50,
		gameOverHeight: 100,
		timeLimit: null,
		description: "Erreiche 3500 Punkte",
		starThresholds: {
			1: { score: 3500, moves: 50, time: null },
			2: { score: 4700, moves: 45, time: null },
			3: { score: 6500, moves: 40, time: null }
		}
	},
	7: {
		targetScore: 50000,
		maxMoves: 55,
		gameOverHeight: 300,
		timeLimit: null,
		description: "Erreiche 5000 Punkte",
		starThresholds: {
			1: { score: 5000, moves: 55, time: null },
			2: { score: 6800, moves: 50, time: null },
			3: { score: 9500, moves: 45, time: null }
		}
	},
	8: {
		targetScore: 7500,
		maxMoves: 60,
		gameOverHeight: 100,
		timeLimit: null,
		description: "Erreiche 7500 Punkte",
		starThresholds: {
			1: { score: 7500, moves: 60, time: null },
			2: { score: 10500, moves: 55, time: null },
			3: { score: 15000, moves: 50, time: null }
		}
	},
	9: {
		targetScore: 12000,
		maxMoves: 70,
		gameOverHeight: 100,
		timeLimit: null,
		description: "Erreiche 12000 Punkte - Master Level!",
		starThresholds: {
			1: { score: 12000, moves: 70, time: null },
			2: { score: 18000, moves: 65, time: null },
			3: { score: 25000, moves: 60, time: null }
		}
	}
}
