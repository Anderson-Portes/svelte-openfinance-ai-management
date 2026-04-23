<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Sparkles, Send, User, Bot, Loader } from 'lucide-svelte';
	import { tick } from 'svelte';

	let { data } = $props();

	let messages = $state<{ role: 'user' | 'assistant'; content: string }[]>([
		{
			role: 'assistant',
			content:
				'Olá! Sou seu consultor financeiro IA. Como posso ajudar você com suas finanças hoje?'
		}
	]);

	let inputMessage = $state('');
	let loading = $state(false);
	let scrollBottom: HTMLElement;

	async function scrollToBottom() {
		await tick();
		if (scrollBottom) {
			scrollBottom.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<div class="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl flex-col space-y-4 p-4 md:p-6">
	<div class="flex items-center gap-2">
		<div class="rounded-full bg-primary/10 p-2 text-primary">
			<Sparkles class="h-6 w-6" />
		</div>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Consultor Financeiro IA</h1>
			<p class="text-muted-foreground">Tire dúvidas sobre seus gastos e peça dicas de economia.</p>
		</div>
	</div>

	<Card class="flex flex-1 flex-col overflow-hidden border-primary/10 shadow-lg">
		<CardHeader class="border-b bg-slate-50/50 py-3">
			<CardTitle class="flex items-center gap-2 text-sm font-medium">
				<Bot class="h-4 w-4 text-primary" />
				Vallo Advisor
			</CardTitle>
		</CardHeader>

		<CardContent class="flex flex-1 flex-col overflow-hidden p-0">
			<div class="flex-1 space-y-6 overflow-y-auto bg-slate-50/20 p-6">
				{#each messages as message}
					<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
						<div class="flex max-w-[85%] gap-3 {message.role === 'user' ? 'flex-row-reverse' : ''}">
							<div
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm select-none
								{message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white text-slate-600'}"
							>
								{#if message.role === 'user'}
									<User class="h-4 w-4" />
								{:else}
									<Bot class="h-4 w-4" />
								{/if}
							</div>
							<div
								class="rounded-2xl px-5 py-3 text-base leading-relaxed shadow-sm
								{message.role === 'user'
									? 'rounded-tr-none bg-primary text-primary-foreground'
									: 'rounded-tl-none border border-slate-200 bg-white text-slate-800'}"
							>
								<p class="whitespace-pre-wrap">{message.content}</p>
							</div>
						</div>
					</div>
				{/each}

				{#if loading}
					<div class="flex justify-start">
						<div class="flex max-w-[85%] gap-3">
							<div
								class="flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-slate-100 text-slate-400"
							>
								<Bot class="h-4 w-4" />
							</div>
							<div
								class="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm"
							>
								<Loader class="h-4 w-4 animate-spin text-primary" />
								<span class="text-xs text-muted-foreground italic">Analisando seus dados...</span>
							</div>
						</div>
					</div>
				{/if}
				<div bind:this={scrollBottom}></div>
			</div>

			<div class="border-t bg-white p-4">
				<form
					method="POST"
					action="?/ask"
					use:enhance={() => {
						loading = true;
						messages.push({ role: 'user', content: inputMessage });
						inputMessage = '';
						scrollToBottom();

						return async ({ result }) => {
							loading = false;
							if (result.type === 'success' && result.data?.answer) {
								messages.push({ role: 'assistant', content: result.data.answer as string });
							} else if (result.type === 'failure') {
								messages.push({
									role: 'assistant',
									content:
										'⚠️ ' +
										((result.data?.message as string) ||
											'Ocorreu um erro ao processar sua solicitação.')
								});
							}
							scrollToBottom();
						};
					}}
					class="flex gap-2"
				>
					<input type="hidden" name="context" value={data.financialContext} />
					<input type="hidden" name="history" value={JSON.stringify(messages)} />
					<Input
						name="message"
						placeholder="Ex: Como foram meus gastos com alimentação este mês?"
						bind:value={inputMessage}
						disabled={loading}
						autocomplete="off"
						class="h-11 flex-1 border-slate-200 focus:ring-primary"
					/>
					<Button type="submit" disabled={loading || !inputMessage.trim()} class="h-11 px-5">
						{#if loading}
							<Loader class="h-4 w-4 animate-spin" />
						{:else}
							<Send class="mr-2 h-4 w-4" />
							Enviar
						{/if}
					</Button>
				</form>

			</div>
		</CardContent>
	</Card>
</div>

<style>
	:global(.whitespace-pre-wrap) {
		word-break: break-word;
	}
</style>
