<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';
	import { LayoutDashboard, Wallet, LogOut } from 'lucide-svelte';
	import { page } from '$app/state';

	let { children, data } = $props();
</script>

<Sidebar.Provider>
	<div class="flex h-screen w-full bg-slate-50">
		<Sidebar.Root>
			<Sidebar.Header class="p-4">
				<h2 class="text-xl font-bold tracking-tight text-primary">Vallo AI</h2>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Group>
					<Sidebar.GroupLabel>Menu</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={page.url.pathname === '/dashboard'}>
									{#snippet child({ props })}
										<a href="/dashboard" {...props}>
											<LayoutDashboard class="mr-2 h-4 w-4" />
											<span>Visão Geral</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>

							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={page.url.pathname === '/dashboard/accounts'}>
									{#snippet child({ props })}
										<a href="/dashboard/accounts" {...props}>
											<Wallet class="mr-2 h-4 w-4" />
											<span>Contas</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			</Sidebar.Content>
			<Sidebar.Footer class="border-t p-4">
				<div class="flex items-center gap-3">
					<div class="flex-1 overflow-hidden text-sm">
						<p class="truncate font-medium">{data.user?.name}</p>
						<p class="truncate text-xs text-muted-foreground">{data.user?.email}</p>
					</div>
					<form action="/logout" method="POST">
						<Button variant="ghost" size="icon" type="submit">
							<LogOut class="h-4 w-4" />
						</Button>
					</form>
				</div>
			</Sidebar.Footer>
		</Sidebar.Root>

		<main class="flex-1 overflow-y-auto p-8">
			{@render children()}
		</main>
	</div>
</Sidebar.Provider>
