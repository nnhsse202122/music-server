
// @ts-ignore
class ShowcaseDisplay {

    private _element: HTMLDivElement;
    private _cards: HTMLCollectionOf<HTMLDivElement>;
    private _buttonsContainer: HTMLDivElement;
    private _buttons: HTMLButtonElement[];
    private _timeout: any;
    private _index: number;

    /**
     * @param {HTMLDivElement} element The element that is a showcase
     */
    public constructor(element: HTMLDivElement) {

        /**
         * @private
         * @type {HTMLDivElement}
         */
        this._element = element;
        /**
         * @type {HTMLCollectionOf<HTMLDivElement>}
         * @private
         */
        this._cards = element.getElementsByClassName("card-display")[0].getElementsByClassName("card") as HTMLCollectionOf<HTMLDivElement>;
        /**
         * @type {HTMLDivElement}
         * @private
         */
        this._buttonsContainer = element.getElementsByClassName("button-container")[0] as HTMLDivElement;

        /**
         * @type {HTMLButtonElement[]}
         * @private
         */
        this._buttons = [];
        for (let index = 0; index < this._cards.length; index++) {
            let btnEl = document.createElement("button");
            btnEl.setAttribute("data-index", index.toString());
            btnEl.addEventListener("click", (ev) => {
                // @ts-ignore
                let clickedIndex = parseInt(ev.target.getAttribute("data-index"));
                if (isNaN(clickedIndex)) return;

                this.setCardIndex(clickedIndex);
            });
            this._buttons.push(btnEl);

            this._buttonsContainer.appendChild(btnEl);
        }

        this._buttonsContainer.setAttribute("style", "--card-count: " + this._cards.length + ";");

        /**
         * @private
         */
        this._timeout = null;

        /**
         * @private
         * @type {number}
         */
        this._index = -1;

        this.nextCard();
    }

    /**
     * @type {HTMLDivElement | null}
     */
    public get currentCard(): HTMLDivElement | null {
        if (this._index < 0 || this._index >= this._cards.length) return null;
        return this._cards[this._index];
    }

    /**
     * @type {HTMLButtonElement | null}
     */
    public get currentCardButton(): HTMLButtonElement | null {
        if (this._index < 0 || this._index >= this._cards.length) return null;
        return this._buttons[this._index];
    }

    /**
     * @public
     */
    public nextCard() {
        let nextIndex = this._index + 1;
        if (nextIndex >= this._cards.length) nextIndex = 0;

        this.setCardIndex(nextIndex);
    }

    /**
     * @public
     */
    public previousCard() {
        let previousIndex = this._index - 1;
        if (previousIndex < 0) previousIndex = this._cards.length - 1;

        this.setCardIndex(previousIndex);
    }
    
    /**
     * @public
     * @param {number} index The index to set the card to.
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

        clearTimeout(this._timeout);
        this._timeout = setTimeout(() => this.nextCard(), 5000);
    }

}

// @ts-ignore
let showcaseDisplays = [...document.getElementsByClassName("showcase")].map((showcaseElement) => new ShowcaseDisplay(showcaseElement as HTMLDivElement));