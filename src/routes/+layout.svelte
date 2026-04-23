<script lang="ts">
	import './layout.css';
	let { children } = $props();
</script>

<svelte:head>
	<script src="https://cdn.pluggy.ai/pluggy-connect/v2.8.2/pluggy-connect.js"></script>
</svelte:head>

{@render children()}
