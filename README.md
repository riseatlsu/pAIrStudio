# pAIrStudio

**Modular Web-Based Experimental Platform for Warehouse Robot Simulation with AI Pair Programming**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Firebase](https://img.shields.io/badge/Firebase-12.8.0-orange)](https://firebase.google.com/)
[![Phaser](https://img.shields.io/badge/Phaser-3.90.0-purple)](https://phaser.io/)
[![Blockly](https://img.shields.io/badge/Blockly-12.3.1-green)](https://developers.google.com/blockly)

## Project Overview

pAIrStudio is a research platform designed to study the effectiveness of AI-assisted programming in educational contexts. Participants complete visual programming challenges to control a warehouse robot in an isometric environment while receiving varying levels of AI assistance based on experimental group assignment.

### Key Features

- **Visual Block Programming**: Drag-and-drop Blockly interface for creating robot control logic
- **Isometric Game Environment**: Phaser 3-based warehouse simulation with real-time robot movement
- **AI Chatbot Integration**: Context-aware AI assistant powered by OpenAI GPT-4
- **Comprehensive Data Logging**: Firebase-backed event tracking for research analysis (48+ data points including collision tracking)
- **Offline-First Design**: Robust queueing system ensures zero data loss during connectivity issues
- **Modular Experimental Framework**: Easy configuration of groups, features, and level progressions

## Tools Used

### Frontend Technologies
- **Phaser 3** (v3.90.0) - Game engine for isometric visualization
- **Blockly** (v12.3.1) - Visual programming interface
- **Vite** (v7.3.1) - Build tool and development server
- **Bootstrap 5** (v5.3.3) - UI framework for modals and forms

### Backend Services
- **Firebase** (v12.8.0)
  - Firestore - NoSQL database for participant data and events
  - Authentication - Anonymous user tracking
  - Cloud Functions - OpenAI API proxy for chatbot
- **OpenAI API** (GPT-4o-mini) - AI chatbot responses

### Development Tools
- **Node.js** (v24) - Runtime environment
- **Firebase Tools** (v15.3.1) - Deployment CLI
- **Git** - Version control

## Architecture

### System Overview

```
┌─────────────────┐
│   index.html    │  Consent UI, Layout Structure
└────────┬────────┘
         │
    ┌────▼─────┐
    │ main.js  │  Application Entry Point
    └────┬─────┘
         │
         ├──────────────────┬──────────────────┬─────────────────┐
         │                  │                  │                 │
    ┌────▼────┐      ┌──────▼──────┐   ┌─────▼─────┐   ┌──────▼──────┐
    │ Phaser  │      │  Blockly    │   │ Chatbot   │   │ Experiment  │
    │ Engine  │      │  Workspace  │   │  Manager  │   │  Manager    │
    └────┬────┘      └──────┬──────┘   └─────┬─────┘   └──────┬──────┘
         │                  │                │                 │
         │                  │                │                 │
         └──────────────────┴────────────────┴─────────────────┘
                                   │
                            ┌──────▼──────┐
                            │ DataLogger  │
                            └──────┬──────┘
                                   │
                            ┌──────▼──────┐
                            │  Firebase   │
                            │  Firestore  │
                            └─────────────┘
```

### Data Flow

1. **User Interaction** → Events captured in browser
2. **Event Processing** → DataLogger queues/logs to Firebase
3. **State Management** → Managers coordinate feature availability
4. **AI Integration** → ChatbotManager sends context to Cloud Function
5. **API Request** → Cloud Function proxies to OpenAI
6. **Response Delivery** → Assistant message displayed and logged

### Directory Structure

```
pAIrStudio/
├── index.html                    # Main application entry
├── package.json                  # Frontend dependencies
├── vite.config.js                # Build configuration
├── firebase.json                 # Firebase deployment config
├── functions/                    # Firebase Cloud Functions
│   ├── index.js                  # OpenAI chatbot proxy
│   └── package.json              # Functions dependencies
├── public/                       # Static assets
│   └── assets/                   # Images, sprites
├── sandbox/                      # Development/testing interface
│   └── index.html                # Standalone sandbox UI
└── src/                          # Source code (see src/README.md)
    ├── main.js                   # App initialization
    ├── styles.css                # Global styles
    ├── chatbot/                  # AI assistant module
    ├── experiment/               # Group assignment system
    ├── game/                     # Game engine and levels
    ├── survey/                   # Post-study questionnaire
    └── utils/                    # Data logging utilities
```

See [src/README.md](src/README.md) for detailed source code documentation.

## Installation & Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Firebase account** (for deployment)
- **OpenAI API key** (for chatbot functionality)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/riseatlsu/pAIrStudio.git
   cd pAIrStudio
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Configure Firebase**
   - Update `firebaseConfig` in `src/utils/DataLogger.js`
   - Deploy cloud functions:
     ```bash
     npm run deploy:functions
     ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open browser to `http://localhost:5173`

### Production Deployment

```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy Cloud Functions
firebase deploy --only functions
```

## Usage

### For Researchers

#### Running an Experiment

1. **Configure Experimental Groups**
   - Edit `src/experiment/GroupConfig.js`
   - Set `ASSIGNMENT_WEIGHTS` for desired group distribution
   - Currently configured: Control (50%) vs. Standard AI (50%)

2. **Deploy to Production**
   ```bash
   npm run build
   firebase deploy
   ```

3. **Share Study URL** with participants

4. **Monitor Data Collection**
   - Access Firebase Console
   - View Firestore → `participants` collection
   - Track collision events to analyze navigation errors

#### Analyzing Data

```javascript
// Query all participants
db.collection('participants').get()

// Query specific group
db.collection('participants')
  .where('experimentalGroup', '==', 'standard_ai')
  .get()

// Access events for a participant
db.collection('participants')
  .doc(userId)
  .collection('events')
  .orderBy('timestamp')
  .get()
```

### For Developers

#### Adding New Levels

1. Create level file in `src/game/levels/data/`
2. Import in `src/game/levels/index.js`
3. Add to `EXPERIMENTAL_LEVELS` in `GroupConfig.js`

See `src/game/levels/LEVEL_TYPES_GUIDE.md` for level schema.

#### Adding New Experimental Groups

1. Add group to `GROUPS` object in `GroupConfig.js`
2. Define features in `GROUP_FEATURES`
3. Add weight to `ASSIGNMENT_WEIGHTS`
4. Update chatbot prompts in `src/chatbot/PromptConfig.js` (if needed)

See `src/experiment/README.md` for detailed documentation.

#### Customizing Data Collection

```javascript
// Log custom events
window.dataLogger.logEvent('custom_event_type', {
    customField: 'value',
    metadata: { key: 'data' }
});
```

See `src/README.md` for complete data mapping table and API reference.

## Experimental Groups

| Group ID | Description | Chatbot |
|----------|-------------|---------|
| `control` | No AI assistance | ❌ |
| `standard_ai` | AI helper (passive) | ✅ |

**Default Assignment**: Equal probability (50% each)


## Testing & Sandbox Mode

A sandbox testing interface is available at `sandbox/index.html` for:
- Testing levels without group assignment
- Bypassing consent flow
- Manually selecting experimental conditions
- Rapid iteration during development

Access via `/sandbox/` after starting dev server.

## Data Privacy & Ethics

- **Consent-First**: Firebase authentication not initialized until user accepts consent
- **Anonymous Tracking**: No personally identifiable information collected- **Comprehensive Event Logging**: Tracks interactions, collisions, chat messages, and code execution- **Offline Support**: Data queued locally if connection lost, synced when restored
- **IRB Compliance**: Consent form customizable in `index.html`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

ISC License - See LICENSE file for details

## Contact & Support

- **Repository**: [github.com/riseatlsu/pAIrStudio](https://github.com/riseatlsu/pAIrStudio)
- **Issues**: [GitHub Issues](https://github.com/riseatlsu/pAIrStudio/issues)
- **Documentation**: See `src/README.md` for detailed source documentation

## Acknowledgments

- **Research Team**: LSU RISE Lab
- **Technologies**: Phaser, Blockly, Firebase, OpenAI
- **Participants**: Thank you to all study participants

---

**Version**: 1.0.0  
**Last Updated**: February 2026
