import LoginPanel from "@/components/loginPanel"

export default function Home({
  params,
}: {
  params: { userId: string }
}) {
  const { userId } = params

  return <LoginPanel userId={decodeURIComponent(userId)} />
}
