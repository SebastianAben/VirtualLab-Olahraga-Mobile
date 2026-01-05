require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { signUp, signIn } = require('./auth');
const challenges = require('./challenges');
const gradeInsights = require('./gradeInsights');
const { updateSimulation, setIntensity, calculateGrade } = require('./simulationEngine');
const authMiddleware = require('./middleware/authMiddleware');
const SimulationResult = require('./models/SimulationResult');

const app = express();
const port = process.env.PORT || 5001;
const dbURI = process.env.MONGODB_URI;

if (!dbURI || !process.env.JWT_SECRET) process.exit(1);

app.use(cors());
app.use(express.json());

mongoose.connect(dbURI).then(() => console.log('Connected to MongoDB')).catch(err => console.error(err));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

const simulations = {};

io.on('connection', (socket) => {
  let simulationInterval;
  const simulationId = socket.id;

  socket.on('start_simulation', () => {
    simulations[simulationId] = {
      currentHeartRate: 70,
      targetHeartRate: 70,
      intensity: 'rest',
      zone: 'resting',
      history: [70],
      heartRateVelocity: 0,
      elapsedTime: 0,
      timeInZone: 0,
      challenge: null,
      completed: false,
      grade: null,
    };

    if (simulationInterval) clearInterval(simulationInterval);

    let lastUpdate = Date.now();
    simulationInterval = setInterval(() => {
      const now = Date.now();
      const deltaTime = now - lastUpdate;
      lastUpdate = now;

      let state = simulations[simulationId];
      if (!state) return;

      state = updateSimulation(state, deltaTime);

      state.history.push(state.currentHeartRate);
      if (state.history.length > 150) state.history.shift();

      if (state.challenge && !state.completed) {
        state.elapsedTime += deltaTime / 1000;
        if (state.zone === state.challenge.targetZone) {
          state.timeInZone += deltaTime / 1000;
        }
        if (state.elapsedTime >= state.challenge.totalDuration) {
          state.grade = calculateGrade(state.timeInZone, state.challenge.goalDuration);
          state.completed = true;
        }
      }

      simulations[simulationId] = state;
      socket.emit('simulation_update', state);
    }, 100);
  });

  socket.on('set_challenge', (challenge) => {
    if (simulations[simulationId]) {
      simulations[simulationId].challenge = challenge;
      simulations[simulationId].timeInZone = 0;
      simulations[simulationId].elapsedTime = 0;
      simulations[simulationId].grade = null;
      simulations[simulationId].completed = false;
    }
  });

  socket.on('set_intensity', (intensity) => {
    if (simulations[simulationId]) {
      simulations[simulationId] = setIntensity(simulations[simulationId], intensity);
    }
  });

  socket.on('stop_simulation', () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
  });

  socket.on('disconnect', () => {
    if (simulationInterval) clearInterval(simulationInterval);
    delete simulations[simulationId];
  });
});

app.get('/', (req, res) => res.send('Hello from the backend!'));

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, userId } = await signUp(email, password);
    res.status(201).json({ token, userId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, userId } = await signIn(email, password);
    res.json({ token, userId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/results', authMiddleware, async (req, res) => {
  try {
    const { challenge, timeAchieved, grade } = req.body;
    const result = new SimulationResult({ userId: req.user._id, challenge, timeAchieved, grade });
    await result.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/results', authMiddleware, async (req, res) => {
  try {
    const results = await SimulationResult.find({ userId: req.user._id }).sort({ timestamp: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/challenges', (req, res) => res.json(challenges));
app.get('/api/grade-insights', (req, res) => res.json(gradeInsights));

server.listen(port, () => console.log(`Server running on port: ${port}`));
