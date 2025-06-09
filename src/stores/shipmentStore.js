import { defineStore } from 'pinia';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:3001/api'; // we will use this for the backend URL
const SOCKET_URL = 'http://localhost:3001'; // socket server URL

export const useShipmentStore = defineStore('shipments', {
    state: () => ({
        shipments: [],
        selectedShipment: null,
        isLoading: false,
        error: null,
        socket: null,
        alerts: [], // UI alerts notifications
    }),
    actions: {
        async fetchShipments() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await axios.get(`${API_URL}/shipments`);
                this.shipments = response.data;
            } catch (err) {
                this.error = err.message || 'Failed to fetch shipments';
                console.error("Error fetching shipments:", err);
            } finally {
                this.isLoading = false;
            }
        },
        async fetchShipmentById(id) {
            this.isLoading = true;
            this.error = null;
            try {
                // Try to find in existing list first
                const existingShipment = this.shipments.find(s => s.id === id);
                if (existingShipment) {
                    this.selectedShipment = existingShipment;
                } else {
                    // If not found, fetch from API
                    const response = await axios.get(`${API_URL}/shipments/${id}`);
                    this.selectedShipment = response.data;
                    // Optionally add/update it in the main shipments list as well
                    const index = this.shipments.findIndex(s => s.id === response.data.id);
                    if (index !== -1) {
                        this.shipments[index] = response.data;
                    } else {
                        this.shipments.push(response.data);
                    }
                }
            } catch (err) {
                this.error = `Failed to fetch shipment ${id}: ${err.message}`;
                console.error(`Error fetching shipment ${id}:`, err);
            } finally {
                this.isLoading = false;
            }
        },
        connectWebSocket() {
            if (this.socket && this.socket.connected) return;

            this.socket = io(SOCKET_URL, {
                transports: ['websocket'], // Optional: force websockets if polling issues
            });

            this.socket.on('connect', () => {
                console.log('Connected to WebSocket server:', this.socket.id);
            });

            this.socket.on('shipmentUpdate', (updatedShipment) => { // Changed param name for clarity
                console.log('Received shipmentUpdate:', updatedShipment);
                const index = this.shipments.findIndex(s => s.id === updatedShipment.id);
                if (index !== -1) {
                    // Preserve existing properties if updatedShipment is partial, or replace entirely
                    this.shipments[index] = { ...this.shipments[index], ...updatedShipment };
                    if (this.selectedShipment && this.selectedShipment.id === updatedShipment.id) {
                        this.selectedShipment = { ...this.selectedShipment, ...updatedShipment };
                    }
                } else {
                    // If it's a new shipment not previously known (e.g. created by another user)
                    this.shipments.push(updatedShipment);
                }
            });

            this.socket.on('shipmentCreated', (newShipment) => {
                console.log('Received shipmentCreated:', newShipment);
                // Check if it already exists to prevent duplicates if this client also created it via API
                if (!this.shipments.some(s => s.id === newShipment.id)) {
                    this.shipments.unshift(newShipment); // Corrected: unshif -> unshift
                }
            });

            this.socket.on('shipmentAlert', (alertData) => {
                console.log('Received shipmentAlert:', alertData);
                const newAlert = { ...alertData, id: Date.now(), show: true };
                this.alerts.push(newAlert);
                setTimeout(() => {
                    // Corrected: findIndex logic and use newAlert.id
                    const alertIndex = this.alerts.findIndex(a => a.id === newAlert.id);
                    if (alertIndex !== -1) {
                        this.alerts.splice(alertIndex, 1);
                    }
                }, 7000);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Disconnected from WebSocket Server. Reason:', reason);
                if (reason === 'io server disconnect') {
                    // the disconnection was initiated by the server, you need to reconnect manually
                    // this.socket.connect(); // Or handle appropriately
                }
                // else the socket will automatically try to reconnect
            });

            this.socket.on('connect_error', (err) => {
                console.error('WebSocket connection error:', err.message);
            });
        },
        disconnectWebSocket() { // Corrected: disconnectWebSockect -> disconnectWebSocket
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
                console.log('Manually disconnected WebSocket.');
            }
        },

        async addTestShipment(shipmentData) {
            try {
                const response = await axios.post(`${API_URL}/shipments`, shipmentData);
                // The 'shipmentCreated' socket event should ideally handle adding it to the store for all clients
                // If you want to optimistically update for THIS client immediately:
                // if (!this.shipments.some(s => s.id === response.data.id)) {
                //    this.shipments.unshift(response.data);
                // }
                console.log('Test shipment added via API:', response.data);
            } catch (err) {
                console.error('Error adding test shipment:', err);
                // Corrected: use err.response for server error messages
                this.error = err.response?.data?.message || err.message || 'Failed to add shipment';
            }
        }
    },
    getters: { // Added getters block, it was missing if you had it before
        getShipmentById: (state) => (id) => {
          return state.shipments.find(shipment => shipment.id === id);
        }
    }
});