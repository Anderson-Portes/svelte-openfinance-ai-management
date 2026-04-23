<script lang="ts">
	import {
		ArcElement,
		BarElement,
		CategoryScale,
		Chart as ChartJS,
		Filler,
		Legend,
		LinearScale,
		LineElement,
		PointElement,
		RadialLinearScale,
		Title,
		Tooltip
	} from 'chart.js';
	import type { Account, Transaction } from 'pluggy-sdk';
	import { Bar, Doughnut, Line, Radar } from 'svelte-chartjs';

	// Register Chart.js components
	ChartJS.register(
		Title,
		Tooltip,
		Legend,
		ArcElement,
		CategoryScale,
		LinearScale,
		BarElement,
		LineElement,
		PointElement,
		RadialLinearScale,
		Filler
	);

	interface Props {
		accounts: (Account & { transactions: Transaction[] })[];
	}

	let { accounts }: Props = $props();

	// --- 1. Balance Distribution (Doughnut) ---
	const balanceData = $derived({
		labels: accounts.map((a) => a.name),
		datasets: [
			{
				data: accounts.map((a) => a.balance),
				backgroundColor: [
					'rgba(99, 102, 241, 0.8)',
					'rgba(16, 185, 129, 0.8)',
					'rgba(245, 158, 11, 0.8)',
					'rgba(239, 68, 68, 0.8)',
					'rgba(139, 92, 246, 0.8)'
				],
				borderWidth: 0,
				hoverOffset: 10
			}
		]
	});

	// --- 2. Category Spending (Bar) ---
	const categoryTotals = $derived.by(() => {
		const totals: Record<string, number> = {};
		accounts.forEach((acc) => {
			acc.transactions.forEach((tx) => {
				if (tx.amount < 0) {
					const cat = tx.category || 'Outros';
					totals[cat] = (totals[cat] || 0) + Math.abs(tx.amount);
				}
			});
		});
		return Object.entries(totals)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6);
	});

	const categoryData = $derived({
		labels: categoryTotals.map(([cat]) => cat),
		datasets: [
			{
				label: 'Gastos por Categoria',
				data: categoryTotals.map(([, total]) => total),
				backgroundColor: 'rgba(99, 102, 241, 0.6)',
				borderRadius: 8
			}
		]
	});

	// --- 3. Cash Flow Summary (Bar) ---
	const cashFlow = $derived.by(() => {
		let income = 0;
		let expenses = 0;
		accounts.forEach((acc) => {
			acc.transactions.forEach((tx) => {
				if (tx.amount > 0) income += tx.amount;
				else expenses += Math.abs(tx.amount);
			});
		});
		return { income, expenses };
	});

	const cashFlowData = $derived({
		labels: ['Entradas', 'Saídas'],
		datasets: [
			{
				data: [cashFlow.income, cashFlow.expenses],
				backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)'],
				borderRadius: 8
			}
		]
	});

	// --- 4. Balance History (Line Chart - Simulated Last 30 Days) ---
	const balanceHistoryData = $derived.by(() => {
		const days = 30;
		const labels = [];
		const data = [];
		const now = new Date();

		for (let i = days - 1; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));

			// Calculate balance on this day
			let dayBalance = 0;
			accounts.forEach((acc) => {
				let accDayBalance = acc.balance;
				// Subtract transactions that happened AFTER this day to find balance ON this day
				acc.transactions.forEach((tx) => {
					const txDate = new Date(tx.date);
					if (txDate > d) {
						accDayBalance -= tx.amount;
					}
				});
				dayBalance += accDayBalance;
			});
			data.push(dayBalance);
		}

		return {
			labels,
			datasets: [
				{
					label: 'Saldo Total (Simulado)',
					data,
					fill: true,
					borderColor: 'rgb(99, 102, 241)',
					backgroundColor: 'rgba(99, 102, 241, 0.1)',
					tension: 0.4,
					pointRadius: 2
				}
			]
		};
	});

	// --- 5. Spending Profile (Radar Chart) ---
	const radarData = $derived.by(() => {
		const profileCategories = [
			'Alimentação',
			'Transporte',
			'Lazer',
			'Saúde',
			'Educação',
			'Compras'
		];
		const data = profileCategories.map((catName) => {
			let total = 0;
			accounts.forEach((acc) => {
				acc.transactions.forEach((tx) => {
					if (tx.amount < 0 && tx.category?.includes(catName)) {
						total += Math.abs(tx.amount);
					}
				});
			});
			return total;
		});

		return {
			labels: profileCategories,
			datasets: [
				{
					label: 'Perfil de Gastos',
					data,
					backgroundColor: 'rgba(245, 158, 11, 0.2)',
					borderColor: 'rgb(245, 158, 11)',
					pointBackgroundColor: 'rgb(245, 158, 11)',
					borderWidth: 2
				}
			]
		};
	});

	// --- Chart Options ---
	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'bottom' as const,
				labels: { usePointStyle: true, padding: 20, font: { size: 11 } }
			}
		}
	};

	const barOptions = {
		...options,
		scales: {
			y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
			x: { grid: { display: false } }
		}
	};

	const lineOptions = {
		...options,
		scales: {
			y: { grid: { color: 'rgba(0,0,0,0.05)' } },
			x: { grid: { display: false } }
		}
	};

	const radarOptions = {
		...options,
		scales: {
			r: {
				angleLines: { display: true },
				suggestedMin: 0,
				grid: { color: 'rgba(0,0,0,0.1)' }
			}
		}
	};
</script>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
	<!-- Main Balance History (Full Width on lg) -->
	<div class="rounded-xl border bg-card p-6 shadow-sm md:col-span-2 lg:col-span-3">
		<h3 class="mb-4 text-lg font-semibold">Evolução de Patrimônio (30 dias)</h3>
		<div class="h-[300px]">
			<Line data={balanceHistoryData} options={lineOptions} />
		</div>
	</div>

	<!-- Balance Distribution -->
	<div class="rounded-xl border bg-card p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold">Distribuição por Conta</h3>
		<div class="h-[250px]">
			<Doughnut data={balanceData} {options} />
		</div>
	</div>

	<!-- Spending Profile -->
	<div class="rounded-xl border bg-card p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold">Perfil Financeiro</h3>
		<div class="h-[250px]">
			<Radar data={radarData} options={radarOptions} />
		</div>
	</div>

	<!-- Cash Flow Summary -->
	<div class="rounded-xl border bg-card p-6 shadow-sm">
		<h3 class="mb-4 text-lg font-semibold">Fluxo de Caixa</h3>
		<div class="h-[250px]">
			<Bar data={cashFlowData} options={barOptions} />
		</div>
	</div>

	<!-- Category Spending -->
	<div class="rounded-xl border bg-card p-6 shadow-sm md:col-span-2 lg:col-span-3">
		<h3 class="mb-4 text-lg font-semibold">Principais Categorias de Gasto</h3>
		<div class="h-[250px]">
			<Bar data={categoryData} options={barOptions} />
		</div>
	</div>
</div>
