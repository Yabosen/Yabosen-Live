export function FaceitWidget() {
    return (
        <div className="mt-2">
            <iframe
                src="https://faceitlivestats.win/widget-compact-today?hideRank=false&hideChallenger=false&hideWinsLosses=true&rounded=false&transparent=true&isGiant=false&nickname=Yabosen"
                style={{ width: '100%', maxWidth: '250px', height: '110px', border: 'none', overflow: 'hidden' }}
                title="Faceit Stats"
                loading="lazy"
                scrolling="no"
            />
        </div>
    )
}
