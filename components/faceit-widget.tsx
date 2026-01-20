export function FaceitWidget() {
    return (
        <div className="mt-4 w-full">
            <iframe
                src="https://faceitlivestats.win/widget-compact-today?hideRank=false&hideChallenger=false&hideWinsLosses=true&rounded=false&transparent=false&isGiant=true&nickname=Yabosen"
                style={{ width: '100%', height: '130px', border: 'none' }}
                title="Faceit Stats"
                loading="lazy"
            />
        </div>
    )
}
