'use strict';

class Parameter extends HTMLElement{
    name = "";
    cards = [];
    multicards = false;
    accepts = [];
    text = "";
    
    constructor(name){
        super();
        this.name = name;
        this.className = "cardplaceholder";
        this.innerHTML = (this.text ? this.text : this.name);
    }

    setText(txt){
        this.text = txt;
        if (this.cards.length <= 0)
            this.innerHTML = txt;
    }

    placeCard(cardel){
        if (this.innerHTML == this.name || this.innerHTML == this.text || !this.multicards)
            this.innerHTML = "";
        this.id = "";
        this.className = "cardplaceholder filled";
        this.appendChild(cardel);
        cardel.style.top = "";
        cardel.style.left = "";
        cardpholder = null;
        this.cards.push(cardel);
    }

    setAccepted(acc){
        this.accepts = acc;
    }

    copy(){
        let copyinstance = new this.constructor(this.name);
        copyinstance.multicards = this.multicards;
        for (let i = this.attributes.length - 1; i > -1; --i){
            copyinstance.setAttribute(this.attributes[i].name, this.attributes[i].value);
        }
        copyinstance.accepts = this.accepts;
        if (this.text)
            copyinstance.setText(this.text);
        if (this.cards.length > 0){
            for (let card of this.cards){
                copyinstance.placeCard(card);
            }
        }
        // Copy cards if existent
        return copyinstance;
    }

    toJSON(idobj){
        if (this.cards.length <= 0)
            return {};
        if (this.multicards){
            let l = [];
            this.cards.forEach((card) => {
                l.push(card.toJSON(idobj));
            });
            return l;
        }else{
            return this.cards[0].toJSON(idobj);
        }
    }

    reset(cardobj){
        this.cards = this.cards.filter(x => x !== cardobj);
        if (this.cards.length <= 0){
            this.innerHTML = (this.text ? this.text : this.name);
        }
    }
}

customElements.define("macro-param", Parameter);