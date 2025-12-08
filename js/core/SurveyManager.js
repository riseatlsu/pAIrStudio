/**
 * Survey Manager - Handles post-experiment surveys
 * Supports multiple question types and dynamic generation
 */

export class SurveyManager {
  constructor() {
    this.questions = [];
    this.responses = {};
    this.isCompleted = false;
    this.loadSurveyState();
  }

  /**
   * Define survey questions
   * @param {Array} questions - Array of question objects
   */
  defineQuestions(questions) {
    this.questions = questions;
  }

  /**
   * Add a single question
   * @param {Object} question - Question configuration
   */
  addQuestion(question) {
    this.questions.push(question);
  }

  /**
   * Get all questions
   * @returns {Array} Array of questions
   */
  getQuestions() {
    return this.questions;
  }

  /**
   * Save a response to a question
   * @param {string} questionId - Question identifier
   * @param {any} response - User's response
   */
  saveResponse(questionId, response) {
    this.responses[questionId] = response;
    this.saveSurveyState();
  }

  /**
   * Get response for a question
   * @param {string} questionId - Question identifier
   * @returns {any} Response value
   */
  getResponse(questionId) {
    return this.responses[questionId];
  }

  /**
   * Get all responses
   * @returns {Object} All responses
   */
  getAllResponses() {
    return { ...this.responses };
  }

  /**
   * Check if all required questions are answered
   * @returns {boolean} True if survey is complete
   */
  isValid() {
    return this.questions.every(q => {
      if (!q.required) return true;
      const response = this.responses[q.id];
      return response !== undefined && response !== null && response !== '';
    });
  }

  /**
   * Mark survey as completed
   */
  complete() {
    if (!this.isValid()) {
      throw new Error('Please answer all required questions');
    }
    
    this.isCompleted = true;
    this.saveSurveyState();
    
    // Save completion status in cookie
    if (window.ConsentManager && typeof window.ConsentManager.setCookie === 'function') {
      window.ConsentManager.setCookie('survey_completed', 'true', 365);
    }
    
    // Log survey completion for research
    if (window.ConsentManager && typeof window.ConsentManager.logEvent === 'function') {
      window.ConsentManager.logEvent('survey_completed', {
        responses: this.responses,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('Survey completed:', {
        responses: this.responses,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Check if survey has been completed
   * @returns {boolean} True if completed
   */
  hasCompleted() {
    return this.isCompleted;
  }

  /**
   * Reset survey (for testing purposes)
   */
  reset() {
    this.responses = {};
    this.isCompleted = false;
    this.saveSurveyState();
  }

  /**
   * Save survey state to localStorage
   */
  saveSurveyState() {
    try {
      const state = {
        responses: this.responses,
        isCompleted: this.isCompleted
      };
      localStorage.setItem('survey_state', JSON.stringify(state));
    } catch (e) {
      console.error('Error saving survey state:', e);
    }
  }

  /**
   * Load survey state from localStorage
   */
  loadSurveyState() {
    try {
      const saved = localStorage.getItem('survey_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.responses = state.responses || {};
        this.isCompleted = state.isCompleted || false;
      }
    } catch (e) {
      console.error('Error loading survey state:', e);
    }
  }

  /**
   * Generate HTML for a question based on its type
   * @param {Object} question - Question configuration
   * @returns {string} HTML string
   */
  generateQuestionHTML(question) {
    const savedResponse = this.getResponse(question.id);
    const requiredLabel = question.required ? '<span class="required-indicator">*</span>' : '';
    
    let html = `
      <div class="survey-question" data-question-id="${question.id}">
        <div class="survey-question-header">
          <span class="survey-question-number">${question.number || ''}.</span>
          <span class="survey-question-text">${question.text}${requiredLabel}</span>
        </div>
    `;

    if (question.description) {
      html += `<p class="survey-question-description">${question.description}</p>`;
    }

    switch (question.type) {
      case 'multiple-choice':
        html += this.generateMultipleChoiceHTML(question, savedResponse);
        break;
      case 'checkboxes':
        html += this.generateCheckboxesHTML(question, savedResponse);
        break;
      case 'text':
        html += this.generateTextInputHTML(question, savedResponse);
        break;
      case 'textarea':
        html += this.generateTextareaHTML(question, savedResponse);
        break;
      case 'scale':
        html += this.generateScaleHTML(question, savedResponse);
        break;
      default:
        console.warn(`Unknown question type: ${question.type}`);
    }

    html += `</div>`;
    return html;
  }

  generateMultipleChoiceHTML(question, savedResponse) {
    let html = '<div class="survey-options">';
    question.options.forEach((option, index) => {
      const optionId = `${question.id}_option_${index}`;
      const checked = savedResponse === option ? 'checked' : '';
      html += `
        <label class="survey-option">
          <input type="radio" name="${question.id}" value="${option}" id="${optionId}" ${checked}>
          <span>${option}</span>
        </label>
      `;
    });
    html += '</div>';
    return html;
  }

  generateCheckboxesHTML(question, savedResponse) {
    const selected = savedResponse || [];
    let html = '<div class="survey-options">';
    question.options.forEach((option, index) => {
      const optionId = `${question.id}_option_${index}`;
      const checked = selected.includes(option) ? 'checked' : '';
      html += `
        <label class="survey-option">
          <input type="checkbox" name="${question.id}" value="${option}" id="${optionId}" ${checked}>
          <span>${option}</span>
        </label>
      `;
    });
    html += '</div>';
    return html;
  }

  generateTextInputHTML(question, savedResponse) {
    const value = savedResponse || '';
    const placeholder = question.placeholder || '';
    return `
      <input type="text" 
             class="survey-text-input" 
             name="${question.id}" 
             value="${value}" 
             placeholder="${placeholder}"
             ${question.required ? 'required' : ''}>
    `;
  }

  generateTextareaHTML(question, savedResponse) {
    const value = savedResponse || '';
    const placeholder = question.placeholder || 'Enter your response here...';
    const rows = question.rows || 5;
    return `
      <textarea class="survey-textarea" 
                name="${question.id}" 
                rows="${rows}" 
                placeholder="${placeholder}"
                ${question.required ? 'required' : ''}>${value}</textarea>
    `;
  }

  generateScaleHTML(question, savedResponse) {
    const min = question.min || 1;
    const max = question.max || 5;
    const minLabel = question.minLabel || '';
    const maxLabel = question.maxLabel || '';
    
    let html = '<div class="survey-scale">';
    if (minLabel) {
      html += `<span class="survey-scale-label">${minLabel}</span>`;
    }
    html += '<div class="survey-scale-options">';
    for (let i = min; i <= max; i++) {
      const checked = savedResponse === i ? 'checked' : '';
      html += `
        <label class="survey-scale-option">
          <input type="radio" name="${question.id}" value="${i}" ${checked}>
          <span>${i}</span>
        </label>
      `;
    }
    html += '</div>';
    if (maxLabel) {
      html += `<span class="survey-scale-label">${maxLabel}</span>`;
    }
    html += '</div>';
    return html;
  }
}

// Create global instance
window.SurveyManager = new SurveyManager();
