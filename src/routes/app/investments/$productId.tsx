import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/investments/$productId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/investments/$productId"!</div>
}
