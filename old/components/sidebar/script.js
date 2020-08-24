console.log("TEST");

window.API.postJson("/extensions/macrozilla/api/list-classes", {}).then(e => {
    e.list.forEach(bname => {
        let block = document.createElement("DIV");
        block.innerHTML = bname;
        this.shadowRoot.querySelector("#macroblockcontainer").appendChild(block);
    });
}
)
