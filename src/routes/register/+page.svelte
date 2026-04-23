<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<!-- Mudamos o fundo para um gradiente sutil e aumentamos o contraste -->
<div
	class="flex h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4"
>
	<!-- Adicionamos shadow-xl e borda sutil para o card se destacar -->
	<Card.Root class="w-full max-w-md border-white/20 shadow-xl backdrop-blur-sm">
		<Card.Header class="space-y-1 text-center">
			<Card.Title class="text-3xl font-bold tracking-tight">Criar Conta</Card.Title>
			<Card.Description class="text-base">
				Gerencie suas finanças com inteligência.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance class="space-y-4">
				<div class="grid gap-2">
					<Label for="name">Nome Completo</Label>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="João Silva"
						required
						class="bg-white/50"
					/>
				</div>

				<div class="grid gap-2">
					<Label for="email">E-mail</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="nome@exemplo.com"
						required
						class="bg-white/50"
					/>
				</div>

				<div class="grid gap-2">
					<Label for="password">Senha</Label>
					<Input id="password" name="password" type="password" required class="bg-white/50" />
				</div>

				{#if form?.error}
					<div class="rounded-md bg-red-50 p-3">
						<p class="text-center text-sm font-medium text-red-600">{form.error}</p>
					</div>
				{/if}

				<Button type="submit" class="mt-2 w-full shadow-md transition-all hover:scale-[1.01]">
					Cadastrar
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="flex flex-col gap-4 border-t pt-6 text-center">
			<p class="text-sm text-muted-foreground">
				Já tem uma conta?
				<a href="/login" class="font-semibold text-primary underline-offset-4 hover:underline">
					Entrar agora
				</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
''
