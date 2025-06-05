import {defineStore} from 'pinia';
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
                console.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        async fetchShipmentById(id) {
            this.isLoading = true;
            this.error = null;
            try {
                const shipment = this.shipments.find(s => s.id === id);
                if (shipment) {
                    this.selectedShipment = shipment;
                } else {
                    const response = await axios.get(`${API_URL}/shipments/${id}`);
                    this.selectedShipment = response.data;
                }
            } catch (err) {
                this.error = `Failed to fetch shipment ${id}`;
                console.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        connectWebSocket() {
            if (this.socket && this.socket.connected) return;
            this.socket = io(SOCKET_URL);

            this.socket.on('connect', () => {
                console.log('Connected to WebSocket server');
            });

            this.socket.on('shipmentUpdate', (updateShipment) => {
                console.log('Received shipmentUpdate:', updateShipment);
                const index = this.shipments.findIndex(s => s.id === updateShipment.id);
                if (index !== -1) {
                    this.shipments[index] = { ...this.shipments[index], ...updateShipment} ;
                    if (this.selectedShipment && this.selectedShipment.id === updateShipment.id) {
                        this.selectedShipment = { ...this.selectedShipment, ...updateShipment};
                    }
                } else {
                    this.shipments.push(updatedShipment); //creates a new shipment not previously known
                }
            });

            this.socket.on('shipmentCreated', (newShipment) => {
                console.log('Received shipmentCreated:', newShipment);
                this.shipments.unshif(newShipment); // adds to the beginning of the list
            });

            this.socket.on('shipmentAlert', (alertData) => {
                console.log('Received shipmentAlert:', alertData);
                this.alerts.push({ ...alertData, id: Date.now(), show: true});
                setTimeout(() => {
                    const alertIndex = this.alerts.findIndex(alertData.id === alertData.id);
                    if (alertIndex !== -1) this.alerts.splice(alertIndex, 1);
                }, 7000);
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnect from WebSocket Server');
            });
            this.socket.on('connect_error', (err) => {
                console.error('WebSocket connection error:', err);
            });
        },
        disconnectWebSockect() {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }
        },

        async addTestShipment(shipmentData) {
            try {
                const response = await axios.post(`${API_URL}/shipments`, shipmentData);
                console.log('Test shipment add via API:', response.data);
            } catch (err) {
                console.error('Error adding test shipment:', err);
                this.error = response?.data?.message || 'Failed to add shipment';
            }
        }
    },
});