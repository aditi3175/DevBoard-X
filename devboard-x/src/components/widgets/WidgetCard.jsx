"use client"

export default function WidgetCard({
  Icon,
  title,
  value,
  color
}) {

  return (

    <div
      className="flex items-center justify-between p-4 rounded-xl border transition hover:shadow-md bg-surface border-border-subtle hover:border-border-strong"
    >

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">

        <div
          className={`p-3 rounded-lg ${color}`}
        >

          <Icon size={24} />

        </div>

        <div>

          <p
            className="font-medium text-text-muted"
          >
            {title}
          </p>

          <h3
            className="text-2xl font-bold text-text-main"
          >
            {value}
          </h3>

        </div>

      </div>



    </div>

  )

}