from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

@app.route('/predict-misuse', methods=['POST'])
def predict_misuse():
    data = request.json
    # Mock Logic: Higher delay + Budget usage = Higher Risk
    # In real app: Load ML model
    delay_days = data.get('delayDays', 0)
    budget_used_percent = data.get('budgetUsedPercent', 0)
    
    risk_score = 0
    if delay_days > 30:
        risk_score += 40
    if budget_used_percent > 80 and delay_days > 10:
        risk_score += 30
    
    # Add randomness for demo
    risk_score += random.randint(0, 20)
    risk_score = min(risk_score, 100)
    
    return jsonify({
        'riskScore': risk_score,
        'riskLevel': 'High' if risk_score > 70 else 'Medium' if risk_score > 30 else 'Low'
    })

@app.route('/verify-image', methods=['POST'])
def verify_image():
    data = request.json
    # Mock Logic: 
    # In real app: Hash matching, Metadata analysis, Reverse search
    
    cid = data.get('cid', '')
    
    # Return high confidence for demo unless specific 'fake' keyword
    confidence = random.randint(85, 99)
    if 'fake' in cid.lower():
        confidence = random.randint(10, 30)
        
    return jsonify({
        'verificationScore': confidence,
        'isAuthentic': confidence > 70
    })

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    query = data.get('query', '').lower()
    
    response = "I am HeritTrust AI. I can help you track funds."
    
    if "delay" in query:
        response = "Delays are heavily monitored. Contractors must justify delays beyond 30 days."
    elif "fund" in query or "money" in query:
        response = "Funds are locked in Smart Contracts and only released upon verified evidence."
    elif "temple" in query:
        response = "Temple restoration projects are priority. Check the dashboard for specific site status."
        
    return jsonify({
        'response': response
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
