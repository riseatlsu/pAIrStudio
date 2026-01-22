/**
 * SurveyUI.js
 * Handles rendering and user interaction for the survey
 */

export class SurveyUI {
    constructor(surveyManager) {
        this.surveyManager = surveyManager;
        this.container = null;
    }

    /**
     * Render the survey UI
     * @param {string} containerId - The container element ID
     */
    render(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('SurveyUI: Container not found');
            return;
        }

        // Clear container
        this.container.innerHTML = '';

        // Check if already completed
        if (this.surveyManager.isAlreadyCompleted()) {
            this.renderCompletionMessage();
            return;
        }

        // Create survey form
        const form = document.createElement('div');
        form.className = 'survey-form';

        // Add title
        const title = document.createElement('h2');
        title.className = 'survey-title';
        title.textContent = 'Post-Study Survey';
        form.appendChild(title);

        // Add instructions
        const instructions = document.createElement('p');
        instructions.className = 'survey-instructions';
        instructions.textContent = 'Thank you for participating! Please answer the following questions about your experience. Questions marked with * are required.';
        form.appendChild(instructions);

        // Render each question
        this.surveyManager.questions.forEach((question, index) => {
            const questionElement = this.renderQuestion(question, index + 1);
            form.appendChild(questionElement);
        });

        // Add submit button
        const submitButton = document.createElement('button');
        submitButton.className = 'survey-submit-btn';
        submitButton.innerHTML = '<i class="fas fa-check"></i> Submit Survey';
        submitButton.addEventListener('click', () => this.handleSubmit());
        form.appendChild(submitButton);

        this.container.appendChild(form);
    }

    /**
     * Render a single question
     * @param {Object} question - The question object
     * @param {number} number - Question number
     * @returns {HTMLElement}
     */
    renderQuestion(question, number) {
        const wrapper = document.createElement('div');
        wrapper.className = 'survey-question';
        wrapper.dataset.questionId = question.id;

        // Question label
        const label = document.createElement('label');
        label.className = 'survey-question-label';
        label.innerHTML = `${number}. ${question.question}${question.required ? ' <span class="required">*</span>' : ''}`;
        wrapper.appendChild(label);

        // Render input based on type
        let inputElement;
        switch (question.type) {
            case 'multiple-choice':
                inputElement = this.renderMultipleChoice(question);
                break;
            case 'likert':
                inputElement = this.renderLikert(question);
                break;
            case 'long-answer':
                inputElement = this.renderLongAnswer(question);
                break;
            default:
                console.error(`Unknown question type: ${question.type}`);
                return wrapper;
        }

        wrapper.appendChild(inputElement);
        return wrapper;
    }

    /**
     * Render multiple choice question
     */
    renderMultipleChoice(question) {
        const container = document.createElement('div');
        container.className = 'survey-options';

        const savedAnswer = this.surveyManager.getAnswer(question.id);

        question.options.forEach((option, index) => {
            const optionWrapper = document.createElement('div');
            optionWrapper.className = 'survey-option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = question.id;
            input.value = option;
            input.id = `${question.id}_${index}`;
            input.checked = savedAnswer === option;
            input.addEventListener('change', () => {
                this.surveyManager.setAnswer(question.id, option);
            });

            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = option;

            optionWrapper.appendChild(input);
            optionWrapper.appendChild(label);
            container.appendChild(optionWrapper);
        });

        return container;
    }

    /**
     * Render Likert scale question
     */
    renderLikert(question) {
        const container = document.createElement('div');
        container.className = 'survey-likert';

        const savedAnswer = this.surveyManager.getAnswer(question.id);

        const scale = document.createElement('div');
        scale.className = 'likert-scale';

        for (let i = 1; i <= question.scale; i++) {
            const optionWrapper = document.createElement('div');
            optionWrapper.className = 'likert-option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = question.id;
            input.value = i;
            input.id = `${question.id}_${i}`;
            input.checked = savedAnswer === i;
            input.addEventListener('change', () => {
                this.surveyManager.setAnswer(question.id, i);
            });

            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = i;

            optionWrapper.appendChild(input);
            optionWrapper.appendChild(label);
            scale.appendChild(optionWrapper);
        }

        container.appendChild(scale);

        // Add labels
        if (question.labels) {
            const labelsDiv = document.createElement('div');
            labelsDiv.className = 'likert-labels';

            const leftLabel = document.createElement('span');
            leftLabel.className = 'likert-label-left';
            leftLabel.textContent = question.labels[1] || '';

            const rightLabel = document.createElement('span');
            rightLabel.className = 'likert-label-right';
            rightLabel.textContent = question.labels[question.scale] || '';

            labelsDiv.appendChild(leftLabel);
            labelsDiv.appendChild(rightLabel);
            container.appendChild(labelsDiv);
        }

        return container;
    }

    /**
     * Render long answer question
     */
    renderLongAnswer(question) {
        const container = document.createElement('div');
        container.className = 'survey-textarea-wrapper';

        const textarea = document.createElement('textarea');
        textarea.className = 'survey-textarea';
        textarea.placeholder = question.placeholder || 'Enter your answer...';
        textarea.maxLength = question.maxLength || 1000;
        textarea.rows = 5;
        textarea.value = this.surveyManager.getAnswer(question.id) || '';
        textarea.addEventListener('input', (e) => {
            this.surveyManager.setAnswer(question.id, e.target.value);
        });

        const charCount = document.createElement('div');
        charCount.className = 'survey-char-count';
        charCount.textContent = `${textarea.value.length} / ${textarea.maxLength}`;

        textarea.addEventListener('input', () => {
            charCount.textContent = `${textarea.value.length} / ${textarea.maxLength}`;
        });

        container.appendChild(textarea);
        container.appendChild(charCount);

        return container;
    }

    /**
     * Handle survey submission
     */
    async handleSubmit() {
        try {
            await this.surveyManager.submitSurvey();
            this.renderCompletionMessage();
        } catch (e) {
            alert(e.message);
        }
    }

    /**
     * Render completion message
     */
    renderCompletionMessage() {
        this.container.innerHTML = `
            <div class="survey-complete">
                <div class="survey-complete-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Thank You!</h2>
                <p>Your survey responses have been recorded. We appreciate your participation in this study.</p>
                <p class="survey-complete-note">You may now close this window.</p>
            </div>
        `;
    }
}
