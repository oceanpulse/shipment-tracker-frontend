<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" md="4">
                <h2 class="text-xl font-semibold mb-4">Shipments</h2>
                <v-card v-if="shipmentStore.isLoading" class="pa-4 text-center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <p>Loading Shipments...</p>
                </v-card>
                <v-alert v-if="shipmentStore.error" type="error" class="mb-4">{{ shipmentStore.error }}</v-alert>

                <v-list v-if="!shipmentStore.isLoading && shipmentStore.shipments.length" lines="two">
                    <v-list-item
                        v-for="shipment in shipmentStore.shipments"
                        :key="shipment.id"
                        @click="selectShipmentOnMap(shipment)"
                        :to="`/shipment/${shipment.id}`"
                        link
                    >
                        <template v-slot:prepend>
                            <v-icon :color="statusColor(shipment.status)">
                                {{ statusIcon(shipment.status) }}
                            </v-icon>
                        </template>
                        <v-list-item-title class="font-medium">
                            {{ shipment.tracking_number }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            {{ shipment.origin }} to {{ shipment.destination }} - <span :class="`font-semibold text-${statusColor(shipment.status)}-600`">{{ shipment.status }}</span>
                        </v-list-item-subtitle>
                    </v-list-item>
                </v-list>
                <v-card v-if="!shipmentStore.isLoading && !shipmentStore.shipments.length && !shipmentStore.error" class="pa-4 text-center">
                    <p>No shipments found</p>
                    <v-btn
                        color="primary"
                        @click="addSampleShipment"
                        class="mt-2"
                    >
                        Add Sample Shipment
                    </v-btn>
                </v-card>
            </v-col>

            <v-col cols="12" md="8">
                <div ref="mapContainer" class="w-full h-[600px] rounded-lg shadow-lg"></div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
// MERGED SCRIPT SETUP BLOCK
import { ref, onMounted, onUnmounted, watch } from 'vue';
// Using ALIAS path for consistency. Ensure your vite.config.js has @ -> src/ alias.
import { useShipmentStore } from '@/stores/shipmentStore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import { v4 as uuidv4 } from 'uuid';

// Leaflet icon fix
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl
});

const shipmentStore = useShipmentStore();
const mapContainer = ref(null);
let map = null;
const markers = ref({});

const statusColors = {
    PENDING: 'grey',
    IN_TRANSIT: 'blue',
    AT_HUB: 'orange',
    OUT_FOR_DELIVERY: 'teal',
    DELIVERED: 'green',
    DELAYED: 'red',
    EXCEPTION: 'purple'
};

const statusIcons = {
    PENDING: 'mdi-clock-outline',
    IN_TRANSIT: 'mdi-truck-fast',
    AT_HUB: 'mdi-warehouse',
    OUT_FOR_DELIVERY: 'mdi-truck-delivery',
    DELIVERED: 'mdi-check-circle',
    DELAYED: 'mdi-alert-circle',
    EXCEPTION: 'mdi-close-octagon'
};

const statusColor = (status) => statusColors[status] || 'grey';
const statusIcon = (status) => statusIcons[status] || 'mdi-help-circle';

const initMap = () => {
    if (mapContainer.value && !map) {
        map = L.map(mapContainer.value).setView([-28.4793, 24.6727], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        updateMarkers();
    }
};

const createPopupContent = (shipment) => {
    return `
        <b>${shipment.tracking_number}</b><br>
        Status: ${shipment.status}<br>
        To: ${shipment.destination}
    `;
};

const updateMarkers = () => {
    if (!map || !shipmentStore.shipments) return;

    shipmentStore.shipments.forEach(shipment => {
        if (shipment.current_latitude != null && shipment.current_longitude != null) {
            const latLng = [parseFloat(shipment.current_latitude), parseFloat(shipment.current_longitude)];
            if (markers.value[shipment.id]) {
                markers.value[shipment.id].setLatLng(latLng);
                markers.value[shipment.id].getTooltip().setContent(createPopupContent(shipment));
            } else {
                const marker = L.marker(latLng).addTo(map);
                marker.bindTooltip(createPopupContent(shipment), { permanent: false, direction: 'top' });
                markers.value[shipment.id] = marker;
            }
        }
    });
};

const selectShipmentOnMap = (shipment) => {
    if (map && markers.value[shipment.id]) {
        map.setView(markers.value[shipment.id].getLatLng(), 13);
        markers.value[shipment.id].openTooltip();
    }
};

const addSampleShipment = async () => {
    const newShipment = {
        id: uuidv4(),
        tracking_number: `TN${Math.floor(Math.random() * 900000) + 100000}`,
        origin: 'Cape Town, CT',
        destination: 'Johannesburg, JHB',
        current_latitude: -33.9258 + (Math.random() - 0.5),
        current_longitude: 18.4232 + (Math.random() - 0.5),
        status: 'PENDING',
        estimated_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    await shipmentStore.addTestShipment(newShipment);
};

onMounted(() => {
    if (shipmentStore.shipments.length === 0 && !shipmentStore.isLoading) {
        shipmentStore.fetchShipments().then(initMap);
    } else {
        initMap(); // If shipments are already there, or if loading is in progress, initMap (it checks for map existence)
    }
});

onUnmounted(() => {
    if (map) {
        map.remove();
        map = null;
    }
});

watch(() => shipmentStore.shipments, updateMarkers, { deep: true });
watch(() => shipmentStore.isLoading, (loading) => {
    if (!loading && shipmentStore.shipments.length > 0 && !map) { // Also check if map isn't already initialized
        initMap();
    }
});
</script>

<style scoped>
    .h-\[600px\] {
        height: 600px;
    }
</style>