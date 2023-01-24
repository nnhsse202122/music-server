
class ShowcaseDisplay {

    private _element: HTMLDivElement;
    private _cards: HTMLCollectionOf<HTMLDivElement>;
    private _buttonsContainer: HTMLDivElement;
    private _buttons: HTMLButtonElement[];
    private _timeout: number | null;
    private _index: number;

    /**
     * @param element The element that is a showcase
     */
    public constructor(element: HTMLDivElement) {

        this._element = element;
        this._cards = element.getElementsByClassName("card-display")[0].getElementsByClassName("card") as HTMLCollectionOf<HTMLDivElement>;
        this._buttonsContainer = element.getElementsByClassName("button-container")[0] as HTMLDivElement;
        this._buttons = [];
        for (let index = 0; index < this._cards.length; index++) {
            let btnEl = document.createElement("button");
            btnEl.setAttribute("data-index", index.toString());
            btnEl.addEventListener("click", (ev) => {
                let clickedIndex = parseInt((ev.target as HTMLButtonElement).getAttribute("data-index")!);
                if (isNaN(clickedIndex)) return;

                this.setCardIndex(clickedIndex);
            });
            this._buttons.push(btnEl);

            this._buttonsContainer.appendChild(btnEl);
        }

        this._buttonsContainer.setAttribute("style", "--card-count: " + this._cards.length + ";");

        this._timeout = null;

        this._index = -1;

        this.nextCard();
    }

    public get currentCard(): HTMLDivElement | null {
        if (this._index < 0 || this._index >= this._cards.length) return null;
        return this._cards[this._index];
    }

    public get currentCardButton(): HTMLButtonElement | null {
        if (this._index < 0 || this._index >= this._cards.length) return null;
        return this._buttons[this._index];
    }

    public nextCard() {
        let nextIndex = this._index + 1;
        if (nextIndex >= this._cards.length) nextIndex = 0;

        this.setCardIndex(nextIndex);
    }

    public previousCard() {
        let previousIndex = this._index - 1;
        if (previousIndex < 0) previousIndex = this._cards.length - 1;

        this.setCardIndex(previousIndex);
    }
    
    /**
     * @param index The index to set the card to.
     */
    public setCardIndex(index: number) {
        let currentCard = this.currentCard;
        let currentCardButton = this.currentCardButton;
        if (currentCard != null && currentCardButton != null) {
            currentCard.removeAttribute("data-visible");
            currentCardButton.removeAttribute("data-visible");
        }

        // clamp index between (length - 1) and (0)
        this._index = Math.max(Math.min(index, this._cards.length - 1), 0);

        currentCard = this.currentCard;
        currentCardButton = this.currentCardButton;
        if (currentCard != null && currentCardButton != null) {
            currentCard.setAttribute("data-visible", "");
            currentCardButton.setAttribute("data-visible", "");
        } 

        clearTimeout(this._timeout!);
        this._timeout = setTimeout(() => this.nextCard(), 5000);
    }

}

let showcaseDisplays = Array.from(document.getElementsByClassName("showcase")).map((showcaseElement) => new ShowcaseDisplay(showcaseElement as HTMLDivElement));