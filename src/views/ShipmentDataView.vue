<template>
    <v-container v-if="shipment">
        <v-btn prepend-icon="mdi-arrow-left" to="/" class="mb-4">Back to List</v-btn>
        <v-card>
            <v-card-title class="text-h5 bg-primary">
                Shipment Details: {{ shipment.tracking_number }}
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <p><strong>ID:</strong> {{ shipment.id }}</p>
                        <p><strong>Origin:</strong> {{ shipment.origin }}</p>
                        <p><strong>Destination:</strong> {{ shipment.destination }}</p>
                        <p><strong>Status:</strong> <v-chip :color="statusColor(shipment.status)" label>{{ shipment.status }}</v-chip></p>
                        <p><strong>Estimated Delivery:</strong> {{ formatDate(shipment.estimated_delivery_date) }}</p>
                        <p><strong>Last Updated:</strong> {{ formatDateTime(shipment.last_updated) }}</p>
                    </v-col>
                    <v-col cols="12" md="6">
                        <p><strong>Current Location:</strong></p>
                        <p>Latitude: {{ shipment.current_latitude }}</p>
                        <p>Longitude: {{ shipment.current_longitude }}</p>
                        <div ref="detailMapContainer" class="w-full h-[300px] mt-2 rounded"></div>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-container>
    <v-container v-else-if="shipmentStore.isLoading" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p>Loading shipment details...</p>
    </v-container>
    <v-container v-else>
        <v-alert type="error">Shipment not found or an error occurred while loading.</v-alert>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
// THIS IS THE IMPORT WE ARE FOCUSING ON:
import { useShipmentStore } from '@/stores/shipmentStore';
import L from 'leaflet';
// Leaflet CSS should be imported once, e.g., in main.js or App.vue, or HomeView.vue
// If not, and if this component can be reached directly without HomeView, uncomment:
// import 'leaflet/dist/leaflet.css';

const route = useRoute();
const shipmentStore = useShipmentStore();
const shipmentId = route.params.id;

const shipment = computed(() => {
    // Ensure shipmentId is a string if your store's IDs are strings
    // and getShipmentById is from the store instance
    return shipmentStore.getShipmentById(String(shipmentId));
});

const detailMapContainer = ref(null);
let detailMap = null;
let detailMarker = null;

const statusColors = {
    PENDING: 'grey',
    IN_TRANSIT: 'blue',
    AT_HUB: 'orange',
    OUT_FOR_DELIVERY: 'teal',
    DELIVERED: 'green',
    DELAYED: 'red',
    EXCEPTION: 'purple'
};
const statusColor = (status) => statusColors[status] || 'grey';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Check if dateString is already a Date object or a valid date string
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
};

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
};

const initDetailMap = () => {
    if (detailMapContainer.value && shipment.value && shipment.value.current_latitude != null && shipment.value.current_longitude != null) {
        const lat = parseFloat(shipment.value.current_latitude);
        const lon = parseFloat(shipment.value.current_longitude);

        if (isNaN(lat) || isNaN(lon)) {
            console.error("Invalid lat/lon for detail map:", shipment.value.current_latitude, shipment.value.current_longitude);
            return;
        }
        const latLng = [lat, lon];

        if (!detailMap) { // Initialize map only if it doesn't exist
            detailMap = L.map(detailMapContainer.value).setView(latLng, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(detailMap);
            detailMarker = L.marker(latLng).addTo(detailMap)
                .bindPopup(`<b>${shipment.value.tracking_number}</b><br>Current Location`)
                .openPopup();
        } else { // Update existing map
            detailMap.setView(latLng);
            detailMarker.setLatLng(latLng);
            detailMarker.getPopup().setContent(`<b>${shipment.value.tracking_number}</b><br>Current Location`);
            detailMarker.openPopup();
        }
    }
};

onMounted(async () => {
    if (shipmentStore.shipments.length === 0 && !shipmentStore.isLoading) {
        console.log("ShipmentDataView: Shipments list empty, fetching all...");
        await shipmentStore.fetchShipments();
    }
    // After fetching (or if already loaded), the computed `shipment` will update.
    // The watcher will then trigger initDetailMap.
    // If the specific shipment is still not found after fetching all,
    // you might need a dedicated fetchShipmentById API call if your backend supports it
    // and if getShipmentById only looks at the local list.
    if (!shipment.value && shipmentId && !shipmentStore.isLoading) {
        console.log(`ShipmentDataView: Shipment ${shipmentId} not in local store, attempting specific fetch.`);
        // This assumes fetchShipmentById updates selectedShipment AND potentially the main list
        await shipmentStore.fetchShipmentById(String(shipmentId));
    }
});

onUnmounted(() => {
    if (detailMap) {
        detailMap.remove();
        detailMap = null;
        detailMarker = null;
    }
});

watch(shipment, (newShipmentData) => {
    if (newShipmentData) {
        console.log("ShipmentDataView: Watched shipment data changed/available:", newShipmentData);
        nextTick(initDetailMap);
    } else if (!shipmentStore.isLoading) {
        console.log("ShipmentDataView: Watched shipment data is null/undefined and not loading.");
    }
}, { immediate: true, deep: true });

</script>

<style scoped>
.h-\[300px\] {
    height:300px;
}
</style>