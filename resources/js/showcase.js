
class ShowcaseDisplay {

    /**
     * @param {HTMLDivElement} element The element that is a showcase
     */
    constructor(element) {

        /**
         * @private
         * @type {HTMLDivElement}
         */
        this._element = element;
        /**
         * @type {HTMLCollectionOf<HTMLDivElement>}
         * @private
         */
        this._cards = element.getElementsByClassName("card-display")[0].getElementsByClassName("card");
        /**
         * @type {HTMLDivElement}
         * @private
         */
        this._buttonsContainer = element.getElementsByClassName("button-container")[0];

        /**
         * @type {HTMLButtonElement[]}
         * @private
         */
        this._buttons = [];
        for (let index = 0; index < this._cards.length; index++) {
            let btnEl = document.createElement("button");
            btnEl.setAttribute("data-index", index.toString());
            btnEl.addEventListener("click", (ev) => {
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
    get currentCard() {
        if (this._index < 0 || this._index >= this._cards.length) return null;
        return this._cards[this._index];
    }

    /**
     * @type {HTMLDivElement | null}
     */
    get currentCardButton() {
        if (this._index < 0 || this._index >= this._cards.length) return null;
        return this._buttons[this._index];
    }

    /**
     * @public
     */
    nextCard() {
        let nextIndex = this._index + 1;
        if (nextIndex >= this._cards.length) nextIndex = 0;

        this.setCardIndex(nextIndex);
    }

    /**
     * @public
     */
    previousCard() {
        let previousIndex = this._index - 1;
        if (previousIndex < 0) previousIndex = this._cards.length - 1;

        this.setCardIndex(previousIndex);
    }
    
    /**
     * @public
     * @param {number} index The index to set the card to.
     */
    setCardIndex(index) {
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

let showcaseDisplays = [...document.getElementsByClassName("showcase")].map((showcaseElement) => new ShowcaseDisplay(showcaseElement));