import React, { useState } from 'react';
import { Save, Moon, Bell, Lock, Eye, EyeOff } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    darkMode: true,
    emailNotifications: true,
    weeklyReport: true,
    churnAlerts: true,
    twoFactor: false,
    privacy: 'private',
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-6 lg:p-8 bg-primary-bg min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-2">Manage your account and preferences</p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/30 text-success flex items-center gap-2">
          <CheckCircle size={20} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="space-y-6 max-w-3xl">
        {/* Account Settings */}
        <Card title="Account Settings" subtitle="Manage your profile information">
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Administrator"
                  className="premium-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="admin@company.com"
                  className="premium-input w-full"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Company
              </label>
              <input
                type="text"
                defaultValue="Analytics Corp"
                className="premium-input w-full"
              />
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card title="Notifications" subtitle="Control how and when you receive updates">
          <div className="space-y-4">
            {[
              {
                id: 'emailNotifications',
                label: 'Email Notifications',
                description: 'Receive email notifications about your account',
              },
              {
                id: 'weeklyReport',
                label: 'Weekly Reports',
                description: 'Get a weekly summary of your churn metrics',
              },
              {
                id: 'churnAlerts',
                label: 'Churn Alerts',
                description: 'Immediate alerts when high-risk customers are identified',
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg bg-tertiary-bg hover:bg-hover-bg transition-colors"
              >
                <div>
                  <p className="font-medium text-text-primary">{item.label}</p>
                  <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.id as any)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    settings[item.id as keyof typeof settings]
                      ? 'bg-accent-primary'
                      : 'bg-secondary-bg border border-border-color'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      settings[item.id as keyof typeof settings]
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card title="Security" subtitle="Protect your account">
          <div className="space-y-4">
            {/* Change Password */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Change Password
              </label>
              <input
                type="password"
                placeholder="New password"
                className="premium-input w-full mb-3"
              />
              <input
                type="password"
                placeholder="Confirm password"
                className="premium-input w-full"
              />
            </div>

            {/* Two Factor Auth */}
            <div className="p-4 rounded-lg bg-tertiary-bg hover:bg-hover-bg transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-accent-primary" />
                <div>
                  <p className="font-medium text-text-primary">Two-Factor Authentication</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('twoFactor')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.twoFactor
                    ? 'bg-accent-primary'
                    : 'bg-secondary-bg border border-border-color'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.twoFactor ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* API Configuration */}
        <Card title="API Configuration" subtitle="Integrate with external services">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  defaultValue="sk_live_51234567890abcdef"
                  className="premium-input flex-1"
                  readOnly
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="px-4 py-2 bg-secondary-bg hover:bg-hover-bg rounded-lg border border-border-color transition-colors"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Webhooks
              </label>
              <input
                type="text"
                placeholder="https://api.yourcompany.com/webhooks"
                className="premium-input w-full"
              />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card title="Appearance" subtitle="Customize your interface">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-tertiary-bg hover:bg-hover-bg transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon size={20} className="text-accent-primary" />
                <div>
                  <p className="font-medium text-text-primary">Dark Mode</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Use dark theme for the interface
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('darkMode')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.darkMode
                    ? 'bg-accent-primary'
                    : 'bg-secondary-bg border border-border-color'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card title="Data & Privacy" subtitle="Manage your data">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Privacy Level
              </label>
              <select className="premium-input w-full">
                <option value="private">Private - Only you can see your data</option>
                <option value="team">Team - Your team can view data</option>
                <option value="public">Public - Anyone with link can view</option>
              </select>
            </div>

            <div className="pt-4 border-t border-border-color space-y-2">
              <Button variant="secondary" size="sm" className="w-full">
                Download Your Data
              </Button>
              <Button variant="secondary" size="sm" className="w-full">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            icon={<Save size={20} />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
          <Button variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// Add CheckCircle icon import
import { CheckCircle } from 'lucide-react';

export default Settings;
