/**
 * whatsapp-report-bot-main/services/email-service.js
 * MASTER ARCHITECTURE: Transporter Broker & Dynamic Rotation Broker
 */

const config = require('../config');[cite: 1]
const realEmailProvider = require('../providers/real-email-provider');[cite: 1]

class EmailService {
    constructor() {
        // Pool layout for horizontal transport scaling
        this.fallbackNodes = JSON.parse(process.env.SMTP_POOL_JSON || '[]');
        this.nodeIndex = 0;
    }

    async sendReport(target, finalizedBody) {
        const activeNode = this.resolveActiveNode();
        
        const manifest = {
            recipient: config.targets.abuseEmail,
            subject: `Incident-Enforcement // ID: ${Math.floor(Math.random() * 100000)}`,
            body: finalizedBody
        };

        return realEmailProvider.sendSecureMail(activeNode, manifest);[cite: 1]
    }

    resolveActiveNode() {
        if (this.fallbackNodes.length === 0) {
            // Hot-swap backup node deployment pattern
            return {
                host: process.env.SMTP_HOST || 'localhost',
                port: parseInt(process.env.SMTP_PORT, 10) || 587,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            };
        }
        const selected = this.fallbackNodes[this.nodeIndex];
        this.nodeIndex = (this.nodeIndex + 1) % this.fallbackNodes.length;
        return selected;
    }
}

module.exports = new EmailService();
