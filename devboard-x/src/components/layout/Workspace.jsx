import { Cpu, Activity, Folder, Server } from "lucide-react";
import WidgetCard from "@/components/widgets/WidgetCard";

export default function Workspace() {
  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-white p-6">
      <h1 className="text-4xl font-bold">Welcome to the DevBoard-X</h1>
      <p className="text-zinc-500">Start by creating a new project</p>
      <div className="grid grid-cols-4 gap-6 mt-6">
        <WidgetCard
        Icon={Cpu}
        title="CPU Usage"
        value="60%"
        color="bg-blue-500"
        />
        <WidgetCard
        Icon={Activity}
        title="Memory Usage"
        value="80%"
        color="bg-red-500"
        />
        <WidgetCard
        Icon={Folder}
        title="Projects"
        value="12"
        color="bg-green-500"
        />
        <WidgetCard
        Icon={Server}
        title="Servers"
        value="3"
        color="bg-yellow-500"
        />
        </div>
    </div>
  )
}