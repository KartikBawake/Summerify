from flask import Flask, render_template, request, jsonify
import requests
import fitz
import os

app = Flask(__name__)

API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
API_KEY = "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"

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def summarize(text, ratio):
    num_words = len(text.split())
    min_length = max(30, int(num_words * ratio * 0.8))
    max_length = max(min_length + 50, int(num_words * ratio))

    headers = {"Authorization": f"Bearer {API_KEY}"}
    data = {
        "inputs": text,
        "parameters": {"max_length": max_length, "min_length": min_length, "do_sample": False}
    }

    response = requests.post(API_URL, headers=headers, json=data)
    response_json = response.json()

    if isinstance(response_json, list) and 'summary_text' in response_json[0]:
        summary = response_json[0]['summary_text']
    else:
        summary = "Error: Could not generate summary. Please try again."

    return summary

def extract_text_from_pdf(pdf_file: str) -> str:
    pdf_text = []
    try:
        with fitz.open(pdf_file) as doc:
            if doc.is_encrypted:
                return "Error: The PDF file is encrypted and cannot be processed."
            for page in doc:
                pdf_text.append(page.get_text())
        return "\n".join(pdf_text)
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize_route():
    text = request.form['input_text']
    ratio = float(request.form['summary_ratio'])

    summary = summarize(text, ratio)
    return render_template('index.html', input_text=text, output_text=summary)

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        print(f"Saving file to: {file_path}")
        file.save(file_path)
        extracted_text = extract_text_from_pdf(file_path)
        if extracted_text.startswith("Error:"):
            return jsonify({'error': extracted_text}), 400
        return jsonify({'text': extracted_text})
    return jsonify({'error': 'File not processed'}), 400

if __name__ == '__main__':
    app.run(debug=True)