import Head from "next/head"
import FirstTimerForm from "../components/FirstTimerForm"
import FirstTimerList from "../components/FirstTimerList"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <Head>
        <title>Church Follow-up App</title>
        <meta name="description" content="First timer follow-up app for our church" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Church Follow-up App</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FirstTimerForm />
          <FirstTimerList />
        </div>
      </main>
    </div>
  )
}

