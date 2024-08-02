document.getElementById('sample-text-btn').addEventListener('click', function() {
    const sampleText = "Education is the process by which a person either acquires or delivers some knowledge to another person. It is also where someone develops essential skills to learn social norms. However, the main goal of education is to help individuals live life and contribute to society when they become older. There are multiple types of education but traditional schooling plays a key role in measuring the success of a person. Besides this, education also helps to eliminate poverty and provides people the chance to live better lives. Let you guys know that this is one of the most important reasons why parents strive to make their kids educate as long as possible. Education is important for everyone as it helps people in living a better life with multiple facilities. It helps individuals to improve their communication skills by learning how to read, write, speak, and listen. It helps people meet basic job requirements and secure better jobs with less effort. The educated population also plays a vital role in building the economy of a nation. Countries with the highest literacy rates are likely to make positive progress in human and economical development. Therefore, it is important for everyone to get the education to live healthy and peaceful life.";
    document.getElementById('input_text').value = sampleText;
    updateWordCount('input_text', 'input-word-count');
});

const slider = document.getElementById('summary_ratio');
const sliderValue = document.getElementById('slider-value');

slider.addEventListener('input', function() {
    let value = slider.value;
    if (value == 0.4) {
        sliderValue.textContent = 'Low';
    } else if (value == 0.6) {
        sliderValue.textContent = 'Medium';
    } else if (value == 0.8) {
        sliderValue.textContent = 'High';
    }
});

document.getElementById('clear-btn').addEventListener('click', function() {
    document.getElementById('input_text').value = '';
    document.getElementById('output_text').value = '';
    updateWordCount('input_text', 'input-word-count');
    updateWordCount('output_text', 'output-word-count');
});

document.getElementById('input_text').addEventListener('input', function() {
    updateWordCount('input_text', 'input-word-count');
});

function updateWordCount(textareaId, buttonId) {
    const textarea = document.getElementById(textareaId);
    const wordCountButton = document.getElementById(buttonId);
    const wordCount = textarea.value.trim().split(/\s+/).filter(word => word.length > 0).length;
    wordCountButton.textContent = `Words: ${wordCount}`;
}

// Initial word count update
updateWordCount('input_text', 'input-word-count');
updateWordCount('output_text', 'output-word-count');

// Prevent form submission from updating input word count
document.getElementById('summarize-form').addEventListener('submit', function() {
    updateWordCount('output_text', 'output-word-count');
});

const summarizeButton = document.getElementById('summarizeButton');
const fileInput = document.getElementById('fileInput');
const loadingSpinner = document.getElementById('loadingSpinner');

summarizeButton.addEventListener('click', () => {
    // Show loading spinner and disable button
    summarizeButton.disabled = true;
    loadingSpinner.classList.remove('hidden');

    // Hide spinner and allow file selection after 3 seconds
    setTimeout(() => {
        loadingSpinner.classList.add('hidden');
        summarizeButton.disabled = false;
        fileInput.click();
    }, 3000); // 3000 milliseconds = 3 seconds
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                document.getElementById('input_text').value = data.text;
                updateWordCount('input_text', 'input-word-count');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});