import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useToastStore } from '@/stores/toast';
import { api } from '../lib/api';
import { KioskActivation } from '../types';
import { PlusIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const KioskActivationPage: React.FC = () => {
  const [kioskId, setKioskId] = useState('');
  const [activations, setActivations] = useState<KioskActivation[]>([]);
  const [systems, setSystems] = useState<string[]>([]);
  const [newSystem, setNewSystem] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemsLoading, setSystemsLoading] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadActivations();
    loadSystems();
    
    // Auto-refresh activations every 30 seconds to sync with other pages
    const interval = setInterval(loadActivations, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystems = async () => {
    try {
      setSystemsLoading(true);
      const data = await api.getKioskSystems();
      setSystems(data?.systems || []);
    } catch (error) {
      console.error('Failed to load systems:', error);
      setSystems([]); // Ensure systems is always an array
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load kiosk systems',
      });
    } finally {
      setSystemsLoading(false);
    }
  };

  const loadActivations = async () => {
    try {
      setLoading(true);
      const data = await api.getKioskActivations();
      setActivations(data);
    } catch (error) {
      console.error('Failed to load activations:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load kiosk activations',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateActivation = async () => {
    try {
      setGeneratingQR(true);
      const activation = await api.generateKioskActivation();
      setActivations([activation, ...activations]);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Kiosk activation code generated successfully',
      });
    } catch (error) {
      console.error('Failed to generate activation:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to generate activation code',
      });
    } finally {
      setGeneratingQR(false);
    }
  };

  const activateKiosk = async () => {
    if (!kioskId.trim()) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Please enter a kiosk ID',
      });
      return;
    }

    try {
      setLoading(true);
      await api.updateKioskStatus(kioskId, { active: true });
      addToast({
        type: 'success',
        title: 'Success',
        description: `Kiosk ${kioskId} activated successfully`,
      });
      setKioskId('');
    } catch (error) {
      console.error('Failed to activate kiosk:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to activate kiosk',
      });
    } finally {
      setLoading(false);
    }
  };

  const addSystem = async () => {
    if (!newSystem.trim()) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Please enter a system name',
      });
      return;
    }

    if ((systems || []).includes(newSystem.trim())) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'This system already exists',
      });
      return;
    }

    try {
      const updatedSystems = [...(systems || []), newSystem.trim()];
      await api.updateKioskSystems(updatedSystems);
      setSystems(updatedSystems);
      setNewSystem('');
      addToast({
        type: 'success',
        title: 'Success',
        description: 'System added successfully',
      });
    } catch (error) {
      console.error('Failed to add system:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to add system',
      });
    }
  };

  const removeSystem = async (systemToRemove: string) => {
    try {
      const updatedSystems = (systems || []).filter(s => s !== systemToRemove);
      await api.updateKioskSystems(updatedSystems);
      setSystems(updatedSystems);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'System removed successfully',
      });
    } catch (error) {
      console.error('Failed to remove system:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to remove system',
      });
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kiosk Management</h1>
        <p className="text-gray-600">
          Manage kiosk activation codes, activate kiosks manually, and configure system options.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Activation */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Manual Activation
          </h2>
          <div className="space-y-4">
            <Input
              label="Kiosk ID"
              value={kioskId}
              onChange={(e) => setKioskId(e.target.value)}
              placeholder="Enter kiosk ID to activate"
            />
            <Button
              variant="primary"
              onClick={activateKiosk}
              disabled={loading || !kioskId.trim()}
              className="w-full"
            >
              Activate Kiosk
            </Button>
          </div>
        </Card>

        {/* QR Code Generation */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Generate Activation QR Code
          </h2>
          <p className="text-gray-600 mb-4">
            Generate a QR code that kiosks can scan to activate themselves.
          </p>
          <Button
            variant="primary"
            onClick={generateActivation}
            disabled={generatingQR}
            className="w-full"
          >
            {generatingQR ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </Card>
      </div>

      {/* Systems Management */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Kiosk Systems Configuration
        </h2>
        <p className="text-gray-600 mb-4">
          Manage the list of systems that appear in the kiosk interface for ticket creation.
        </p>
        
        {/* Add New System */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <Input
              value={newSystem}
              onChange={(e) => setNewSystem(e.target.value)}
              placeholder="Enter new system name"
              onKeyPress={(e) => e.key === 'Enter' && addSystem()}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={addSystem}
              disabled={!newSystem.trim() || systemsLoading}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </div>
        </div>

        {/* Systems List */}
        {systemsLoading ? (
          <div className="text-center py-8">Loading systems...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(systems || []).map((system) => (
              <div
                key={system}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border"
              >
                <span className="text-sm font-medium text-gray-900">
                  {system}
                </span>
                <button
                  onClick={() => removeSystem(system)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remove system"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(systems || []).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No systems configured yet.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Activation Codes List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Activation Codes
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadActivations}
            disabled={loading}
            className="text-blue-600 hover:text-blue-900"
            title="Refresh activation codes"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">Loading activations...</div>
        ) : activations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No activation codes generated yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activations.map((activation) => (
              <div
                key={activation.id}
                className={`border rounded-lg p-4 ${
                  activation.used 
                    ? 'border-gray-300 bg-gray-50' 
                    : isExpired(activation.expiresAt)
                    ? 'border-red-300 bg-red-50'
                    : 'border-green-300 bg-green-50'
                }`}
              >
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-900">
                    Code: {activation.code}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(activation.createdAt).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Expires: {new Date(activation.expiresAt).toLocaleString()}
                  </div>
                </div>
                
                {activation.qrCode && (
                  <div className="mb-3 text-center">
                    <img
                      src={activation.qrCode}
                      alt="QR Code"
                      className="mx-auto max-w-full h-32"
                    />
                  </div>
                )}
                
                <div className="text-center">
                  {activation.used ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Used {activation.usedAt && `on ${new Date(activation.usedAt).toLocaleDateString()}`}
                    </span>
                  ) : isExpired(activation.expiresAt) ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Expired
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
