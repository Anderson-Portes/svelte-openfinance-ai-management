<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import type { Account, Transaction } from 'pluggy-sdk';
	import { invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import DashboardCharts from './DashboardCharts.svelte';

	let { data } = $props();
	let accounts = $state<(Account & { transactions: Transaction[] })[]>([]);

	// Sincroniza os dados do servidor quando chegarem (streaming)
	$effect(() => {
		data.streamed.accounts.then((accs) => {
			accounts = accs;
		});
	});

	async function handleConnect() {
		if (!window.PluggyConnect) {
			alert('O módulo de conexão ainda está carregando...');
			return;
		}

		const pluggyConnect = new window.PluggyConnect({
			connectToken: data.connectToken,
			includeSandbox: true,
			onSuccess: async ({ item }: { item: { id: string } }) => {
				try {
					const formData = new FormData();
					formData.append('itemId', item.id);

					const response = await fetch('?/saveItem', {
						method: 'POST',
						body: formData
					});

					const result = deserialize(await response.text());

					if (result.type === 'success') {
						await invalidateAll();
					} else {
						console.error('Failed to save item via action');
					}
				} catch (error) {
					console.error('Whoops! Error saving item... ', error);
				}
			},
			onError: (error: any) => {
				console.error('Whoops! Pluggy Connect error... ', error);
			}
		});

		pluggyConnect.init();
	}
</script>

<div class="container mx-auto space-y-8 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
			<p class="text-muted-foreground">Bem-vindo ao seu gerenciamento financeiro inteligente.</p>
		</div>
		<Button onclick={handleConnect}>Conectar Novo Banco</Button>
	</div>

	{#await data.streamed.accounts}
		<div class="flex h-64 items-center justify-center">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
			></div>
		</div>
	{:then accountsResolved}
		{#if accountsResolved.length > 0}
			<DashboardCharts accounts={accountsResolved} />

			<Card>
				<CardHeader>
					<CardTitle>Contas Conectadas</CardTitle>
					<CardDescription>Gerencie suas conexões de Open Finance</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Instituição</TableHead>
								<TableHead>Tipo</TableHead>
								<TableHead class="text-right">Saldo</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each accountsResolved as account}
								<TableRow>
									<TableCell class="font-medium">{account.name}</TableCell>
									<TableCell>{account.type}</TableCell>
									<TableCell class="text-right font-mono">
										{new Intl.NumberFormat('pt-BR', {
											style: 'currency',
											currency: account.currencyCode
										}).format(account.balance)}
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		{:else}
			<div
				class="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center"
			>
				<h2 class="mb-2 text-xl font-semibold">Nenhuma conta conectada</h2>
				<p class="mb-6 text-muted-foreground">
					Conecte sua primeira conta para ver suas estatísticas financeiras.
				</p>
				<Button onclick={handleConnect}>Conectar Banco agora</Button>
			</div>
		{/if}
	{:catch error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
			Erro ao carregar dados financeiros: {error.message}
		</div>
	{/await}
</div>
