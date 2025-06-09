<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title class="font-bold">
        Logistics Tracker
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/">Home</v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <!-- Alert Notification-->
     <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <v-alert
        v-for="alert in shipmentStore.alerts"
        :key="alert.id"
        :type="alert.type"
        closable
        class="mb-2"
        @update:modelValue="() => removeAlert(alert.id)"
        v-model="alert.show"
      >
        {{ alert.message }}
      </v-alert>
     </div>

  </v-app>
</template>

<script setup>
  import {onMounted, onUnmounted} from 'vue';
  // Using ALIAS path for consistency. Ensure your vite.config.js has @ -> src/ alias.
  import {useShipmentStore} from '@/stores/shipmentStore';

  const shipmentStore = useShipmentStore();

  onMounted(() => {
    shipmentStore.fetchShipments();
    shipmentStore.connectWebSocket();
  });

  onUnmounted(() => {
    shipmentStore.disconnectWebSocket(); // Typo: disconnectWebSockect -> disconnectWebSocket
  })

  const removeAlert = (alertId) => {
    const index = shipmentStore.alerts.findIndex(a => a.id === alertId);
    if (index > -1) {
      shipmentStore.alerts.splice(index, 1);
    }
  };
</script>

<style>
/* Global styles if needed, or Tailwind can be used in components for more specific styling */
</style>