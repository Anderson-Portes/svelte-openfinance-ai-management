<script lang="ts">
	import { onMount } from 'svelte';
	import type { Account, Transaction } from 'pluggy-sdk';
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
	import { Badge } from '$lib/components/ui/badge';
	import { 
		Wallet, 
		TrendingUp, 
		Building2, 
		CreditCard, 
		ArrowRightLeft 
	} from 'lucide-svelte';
	import {
		BarElement,
		CategoryScale,
		Chart as ChartJS,
		Legend,
		LinearScale,
		Title,
		Tooltip
	} from 'chart.js';
	import { Bar } from 'svelte-chartjs';

	ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

	let { data } = $props();
	let accounts = $state<(Account & { transactions: Transaction[] })[]>([]);
	let loading = $state(true);

	// Sincroniza os dados do servidor quando chegarem (streaming)
	$effect(() => {
		data.streamed.accounts.then((accs) => {
			accounts = accs;
			loading = false;
		}).catch(() => {
			loading = false;
		});
	});

	// --- Derived Statistics ---
	const totalBalance = $derived(accounts.reduce((acc, curr) => acc + curr.balance, 0));
	
	const mainBank = $derived.by(() => {
		if (accounts.length === 0) return null;
		return accounts.reduce((prev, current) => (prev.balance > current.balance ? prev : current));
	});

	const balanceByType = $derived.by(() => {
		const totals: Record<string, number> = {};
		accounts.forEach((acc) => {
			const type = acc.type || 'Outros';
			totals[type] = (totals[type] || 0) + acc.balance;
		});
		return {
			labels: Object.keys(totals),
			datasets: [
				{
					label: 'Saldo por Tipo',
					data: Object.values(totals),
					backgroundColor: 'rgba(99, 102, 241, 0.6)',
					borderRadius: 8
				}
			]
		};
	});

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false }
		},
		scales: {
			y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
			x: { grid: { display: false } }
		}
	};

	const formatCurrency = (value: number, currencyCode = 'BRL') => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: currencyCode
		}).format(value);
	};
</script>

<div class="container mx-auto space-y-8 p-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Relatório de Contas</h1>
		<p class="text-muted-foreground">Análise detalhada de todas as suas conexões financeiras.</p>
	</div>

	{#if loading}
		<div class="flex h-64 items-center justify-center">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
		</div>
	{:else if accounts.length > 0}
		<!-- Summary Cards -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<Card class="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
				<CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
					<CardTitle class="text-sm font-medium">Saldo Consolidado</CardTitle>
					<Wallet class="h-4 w-4 opacity-70" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
					<p class="text-xs opacity-80">+2.1% em relação ao mês passado</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
					<CardTitle class="text-sm font-medium">Contas Ativas</CardTitle>
					<CreditCard class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{accounts.length}</div>
					<p class="text-xs text-muted-foreground">Conectadas via Open Finance</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
					<CardTitle class="text-sm font-medium">Instituição Principal</CardTitle>
					<Building2 class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{mainBank?.name || 'N/A'}</div>
					<p class="text-xs text-muted-foreground">Maior volume de capital</p>
				</CardContent>
			</Card>
		</div>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Detailed List -->
			<div class="lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>Detalhamento das Contas</CardTitle>
						<CardDescription>Lista completa de contas e seus respectivos saldos.</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Conta</TableHead>
									<TableHead>Tipo</TableHead>
									<TableHead>Número / Agência</TableHead>
									<TableHead class="text-right">Saldo</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each accounts as account}
									<TableRow>
										<TableCell>
											<div class="flex items-center gap-3">
												<div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-primary">
													<Building2 class="h-4 w-4" />
												</div>
												<span class="font-medium">{account.name}</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline">{account.type}</Badge>
										</TableCell>
										<TableCell class="font-mono text-xs">
											{account.number || '****'} / {account.marketingName || '-'}
										</TableCell>
										<TableCell class="text-right font-bold">
											{formatCurrency(account.balance, account.currencyCode)}
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>

			<!-- Secondary Stats -->
			<div class="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Distribuição por Tipo</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="h-[250px]">
							<Bar data={balanceByType} options={chartOptions} />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Ações Rápidas</CardTitle>
					</CardHeader>
					<CardContent class="grid gap-2">
						<button class="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50 transition-colors text-left">
							<div class="flex items-center gap-3">
								<ArrowRightLeft class="h-4 w-4 text-primary" />
								<span class="text-sm font-medium">Exportar Relatório (PDF)</span>
							</div>
						</button>
						<button class="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50 transition-colors text-left">
							<div class="flex items-center gap-3">
								<TrendingUp class="h-4 w-4 text-emerald-500" />
								<span class="text-sm font-medium">Analisar Rendimentos</span>
							</div>
						</button>
					</CardContent>
				</Card>
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
			<div class="mb-4 rounded-full bg-slate-100 p-4">
				<Wallet class="h-8 w-8 text-slate-400" />
			</div>
			<h2 class="mb-2 text-xl font-semibold">Nenhuma conta encontrada</h2>
			<p class="mb-6 text-muted-foreground">Você ainda não conectou nenhuma conta bancária.</p>
			<a href="/dashboard" class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
				Voltar para Visão Geral
			</a>
		</div>
	{/if}
</div>
