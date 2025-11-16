// Device Presets Configuration
// Pre-configured settings for popular devices

class DevicePresets {
    constructor() {
        this.presets = this.loadPresets();
        this.customPresets = this.loadCustomPresets();
    }

    // Load built-in presets
    loadPresets() {
        return {
            'google_pixel_7': {
                name: 'Google Pixel 7',
                codename: 'panther',
                manufacturer: 'Google',
                partitions: ['boot', 'vendor_boot', 'dtbo', 'vendor_dlkm', 'system', 'vendor', 'product'],
                bootloaderUnlockCommand: 'fastboot flashing unlock',
                flashCommands: [
                    { partition: 'bootloader', critical: true },
                    { partition: 'radio', critical: true },
                    { partition: 'boot', critical: true },
                    { partition: 'vendor_boot', critical: false },
                    { partition: 'dtbo', critical: false },
                    { partition: 'vendor_dlkm', critical: false }
                ],
                tips: [
                    'Enable OEM unlocking in Developer Options before unlocking bootloader',
                    'Unlocking bootloader will wipe all data',
                    'Flash bootloader and radio first before other partitions'
                ]
            },
            'google_pixel_6': {
                name: 'Google Pixel 6',
                codename: 'oriole',
                manufacturer: 'Google',
                partitions: ['boot', 'vendor_boot', 'dtbo', 'vendor_dlkm', 'system', 'vendor', 'product'],
                bootloaderUnlockCommand: 'fastboot flashing unlock',
                flashCommands: [
                    { partition: 'bootloader', critical: true },
                    { partition: 'radio', critical: true },
                    { partition: 'boot', critical: true },
                    { partition: 'vendor_boot', critical: false },
                    { partition: 'dtbo', critical: false }
                ],
                tips: [
                    'Requires latest platform tools',
                    'Do not disconnect device during flashing'
                ]
            },
            'samsung_galaxy_s22': {
                name: 'Samsung Galaxy S22',
                codename: 'r0s',
                manufacturer: 'Samsung',
                partitions: ['boot', 'recovery', 'system', 'vendor', 'userdata', 'cache'],
                bootloaderUnlockCommand: 'oem unlock',
                flashCommands: [
                    { partition: 'boot', critical: true },
                    { partition: 'recovery', critical: false },
                    { partition: 'system', critical: true },
                    { partition: 'vendor', critical: false }
                ],
                tips: [
                    'Samsung devices use Odin for official flashing',
                    'Unlocking bootloader will trigger Knox and void warranty',
                    'Wait for automatic reboot after flashing'
                ],
                warnings: [
                    'Knox will be permanently triggered',
                    'Samsung Pay and Secure Folder will not work'
                ]
            },
            'xiaomi_mi_11': {
                name: 'Xiaomi Mi 11',
                codename: 'venus',
                manufacturer: 'Xiaomi',
                partitions: ['boot', 'recovery', 'system', 'vendor', 'cust', 'cache', 'userdata'],
                bootloaderUnlockCommand: 'fastboot oem unlock',
                flashCommands: [
                    { partition: 'boot', critical: true },
                    { partition: 'recovery', critical: false },
                    { partition: 'system', critical: true },
                    { partition: 'vendor', critical: false },
                    { partition: 'cust', critical: false }
                ],
                tips: [
                    'Unlock bootloader using Mi Unlock tool first',
                    'Wait 168 hours after binding account to unlock',
                    'Use MiFlash tool for official ROMs'
                ],
                antiRollbackInfo: 'Check anti-rollback version before flashing older ROMs'
            },
            'oneplus_9': {
                name: 'OnePlus 9',
                codename: 'lemonade',
                manufacturer: 'OnePlus',
                partitions: ['boot', 'recovery', 'system', 'vendor', 'odm', 'dtbo', 'vbmeta'],
                bootloaderUnlockCommand: 'fastboot oem unlock',
                flashCommands: [
                    { partition: 'boot', critical: true },
                    { partition: 'recovery', critical: false },
                    { partition: 'dtbo', critical: false },
                    { partition: 'vbmeta', critical: false },
                    { partition: 'system', critical: true },
                    { partition: 'vendor', critical: false }
                ],
                tips: [
                    'Enable OEM unlocking and Advanced reboot in Developer Options',
                    'Unlocking bootloader is reversible',
                    'Flash vbmeta if installing custom ROMs'
                ]
            },
            'motorola_edge_30': {
                name: 'Motorola Edge 30',
                codename: 'dubai',
                manufacturer: 'Motorola',
                partitions: ['boot', 'recovery', 'system', 'vendor', 'dtbo', 'vbmeta'],
                bootloaderUnlockCommand: 'oem unlock <unlock_code>',
                flashCommands: [
                    { partition: 'boot', critical: true },
                    { partition: 'dtbo', critical: false },
                    { partition: 'vbmeta', critical: false },
                    { partition: 'system', critical: true },
                    { partition: 'vendor', critical: false }
                ],
                tips: [
                    'Get unlock code from Motorola website',
                    'Backup persist partition before modifications',
                    'OTA updates will fail after unlocking'
                ],
                unlockInstructions: 'Visit motorola.com/unlock to get unlock code'
            }
        };
    }

    // Load custom presets from localStorage
    loadCustomPresets() {
        try {
            const stored = localStorage.getItem('androidplus_custom_presets');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    // Save custom presets to localStorage
    saveCustomPresets() {
        try {
            localStorage.setItem('androidplus_custom_presets', JSON.stringify(this.customPresets));
        } catch (e) {
            console.error('Failed to save custom presets', e);
        }
    }

    // Get all presets (built-in + custom)
    getAllPresets() {
        return { ...this.presets, ...this.customPresets };
    }

    // Get preset by ID
    getPreset(id) {
        const allPresets = this.getAllPresets();
        return allPresets[id] || null;
    }

    // Add custom preset
    addCustomPreset(id, preset) {
        this.customPresets[id] = preset;
        this.saveCustomPresets();
    }

    // Remove custom preset
    removeCustomPreset(id) {
        delete this.customPresets[id];
        this.saveCustomPresets();
    }

    // Detect device and suggest preset
    detectDevice(deviceInfo) {
        const allPresets = this.getAllPresets();

        // Try to match by codename
        for (const [id, preset] of Object.entries(allPresets)) {
            if (preset.codename && deviceInfo.device === preset.codename) {
                return { id, preset };
            }
        }

        // Try to match by model
        for (const [id, preset] of Object.entries(allPresets)) {
            if (preset.name && deviceInfo.model.toLowerCase().includes(preset.name.toLowerCase())) {
                return { id, preset };
            }
        }

        return null;
    }

    // Generate flash script from preset
    generateFlashScript(presetId, imageFiles) {
        const preset = this.getPreset(presetId);
        if (!preset) return null;

        const steps = [];

        // Add reboot to bootloader
        steps.push({
            type: 'reboot',
            target: 'bootloader',
            description: 'Reboot to bootloader mode'
        });

        steps.push({
            type: 'wait',
            duration: 5,
            description: 'Wait for bootloader'
        });

        // Add flash commands in order
        for (const flashCmd of preset.flashCommands) {
            const imageFile = imageFiles[flashCmd.partition];
            if (imageFile) {
                steps.push({
                    type: 'flash',
                    partition: flashCmd.partition,
                    file: imageFile,
                    critical: flashCmd.critical,
                    description: `Flash ${flashCmd.partition} partition`
                });
            }
        }

        // Add reboot to system
        steps.push({
            type: 'reboot',
            target: '',
            description: 'Reboot to system'
        });

        return {
            name: `Flash ${preset.name}`,
            description: `Automated flash script for ${preset.name}`,
            device: presetId,
            steps
        };
    }

    // Get preset recommendations
    getRecommendations(deviceInfo) {
        const recommendations = [];
        const detected = this.detectDevice(deviceInfo);

        if (detected) {
            recommendations.push({
                type: 'detected',
                preset: detected.preset,
                id: detected.id,
                confidence: 'high',
                message: `Detected ${detected.preset.name}`
            });
        }

        // Add similar devices
        const allPresets = this.getAllPresets();
        for (const [id, preset] of Object.entries(allPresets)) {
            if (preset.manufacturer === deviceInfo.manufacturer && (!detected || id !== detected.id)) {
                recommendations.push({
                    type: 'similar',
                    preset,
                    id,
                    confidence: 'medium',
                    message: `Similar device: ${preset.name}`
                });
            }
        }

        return recommendations;
    }

    // Render presets UI
    renderPresetsUI(container, onSelectCallback) {
        const allPresets = this.getAllPresets();

        let html = '<div class="presets-grid">';

        for (const [id, preset] of Object.entries(allPresets)) {
            const isCustom = this.customPresets[id] !== undefined;

            html += `
                <div class="preset-card" data-preset-id="${id}">
                    <div class="preset-header">
                        <h4>${preset.name}</h4>
                        ${isCustom ? '<span class="badge badge-custom">Custom</span>' : ''}
                    </div>
                    <div class="preset-info">
                        <p><strong>Manufacturer:</strong> ${preset.manufacturer}</p>
                        <p><strong>Codename:</strong> ${preset.codename}</p>
                        <p><strong>Partitions:</strong> ${preset.partitions.length}</p>
                    </div>
                    <div class="preset-actions">
                        <button class="btn btn-small btn-primary preset-select">Select</button>
                        ${isCustom ? '<button class="btn btn-small btn-danger preset-delete">Delete</button>' : ''}
                    </div>
                </div>
            `;
        }

        html += '</div>';

        container.innerHTML = html;

        // Attach event listeners
        container.querySelectorAll('.preset-select').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.preset-card');
                const presetId = card.dataset.presetId;
                if (onSelectCallback) {
                    onSelectCallback(presetId, allPresets[presetId]);
                }
            });
        });

        container.querySelectorAll('.preset-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.preset-card');
                const presetId = card.dataset.presetId;
                if (confirm(`Delete custom preset: ${allPresets[presetId].name}?`)) {
                    this.removeCustomPreset(presetId);
                    this.renderPresetsUI(container, onSelectCallback);
                }
            });
        });
    }

    // Show preset details
    showPresetDetails(preset) {
        let details = `
Device: ${preset.name}
Manufacturer: ${preset.manufacturer}
Codename: ${preset.codename}

Partitions:
${preset.partitions.join(', ')}

Flash Order:
${preset.flashCommands.map((cmd, i) => `${i + 1}. ${cmd.partition}${cmd.critical ? ' (critical)' : ''}`).join('\n')}
`;

        if (preset.tips && preset.tips.length > 0) {
            details += `\n\nTips:\n${preset.tips.map(tip => `• ${tip}`).join('\n')}`;
        }

        if (preset.warnings && preset.warnings.length > 0) {
            details += `\n\n⚠️ Warnings:\n${preset.warnings.map(warn => `• ${warn}`).join('\n')}`;
        }

        return details;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DevicePresets;
}
