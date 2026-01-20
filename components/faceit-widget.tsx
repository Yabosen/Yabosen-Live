export function FaceitWidget() {
    return (
        <div className="mt-2">
            <iframe
                src="https://faceitlivestats.win/widget-compact-today?hideRank=false&hideChallenger=false&hideWinsLosses=true&rounded=false&transparent=false&isGiant=false&nickname=Yabosen"
                style={{ width: '250px', height: '110px', border: 'none' }}
                title="Faceit Stats"
                loading="lazy"
            />
        </div>
    )
}
