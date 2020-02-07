class NodeElement {
    constructor(id, left = 0, top = 0) {
        this.id = id;
        this.relations = {
            1: {nodeID: null},
            2: {nodeID: null},
            3: {nodeID: null},
            4: {nodeID: null}
        };

        this.createElement();

        this.top = top;
        this.left = left;
    }

    createElement() {
        this.element = $(`
            <div class="node" id="node-${this.id}" data-id="${this.id}">
                <div class="button button-1" onclick="addNode(${this.id}, 1)"><div>1</div></div>
                <div class="button button-2" onclick="addNode(${this.id}, 2)"><div>2</div></div>
                <div class="button button-3" onclick="addNode(${this.id}, 3)"><div>3</div></div>
                <div class="button button-4" onclick="addNode(${this.id}, 4)"><div>4</div></div>
                <button class="control-button control-button-x" onclick="deleteNode(${this.id})">x</button>
                <button class="control-button control-button-e">e</button>
            </div>`);

        let self = this;
        this.element.draggable({
            drag() {
                self.left = $(this).css('left');
                self.top = $(this).css('top');

                lines.updateCoordinates();
            }
        }).css('position', 'absolute');

        $('#nodes').append(this.element);
    }

    removeElement() {
        this.element.remove();
    }

    getButton(number) {
        return $(this.element.children()[number - 1]);
    }

    get left() {
        return this._left;
    }

    get top() {
        return this._top;
    }

    set left(left) {
        if (typeof left === 'string') {
            left = +left.slice(0, -2);
        }

        this._left = left;
        this.element.css('left', this.left + 'px');
    }

    set top(top) {
        if (typeof top === 'string') {
            top = +top.slice(0, -2);
        }

        this._top = top;
        this.element.css('top', this.top + 'px');
    }

    addRelation(fromButton, toNodeID) {
        this.relations[fromButton + ''].nodeID = toNodeID;
    }
}

class Nodes {
    constructor() {
        this.items = [];
        this.nextID = 0;
    }

    add(item) {
        this.items.push(item);
        this.nextID++;
    }

    getItem(id) {
        let item = this.items.find(item => item.id === id);

        if (item === undefined) {
            throw new Error(`Node with id ${id} not found`);
        }

        return item;
    }
}

class Line {
    constructor(id, nodeFrom, buttonFrom, nodeTo, buttonTo) {
        this.id = id;

        this.nodeFrom = nodeFrom;
        this.buttonFrom = buttonFrom;

        this.nodeTo = nodeTo;
        this.buttonTo = buttonTo;

        this.createElement();
    }

    createElement() {
        this.element = $(document.createElementNS('http://www.w3.org/2000/svg', 'line'))
            .attr({id: 'line-' + this.id});
        this.updateCoordinates();

        $('#lines').append(this.element);
    }

    getX(button, node) {
        switch (button) {
            case 1:
            case 4:
                return node.left + node.element.width() / 2;
            case 2:
                return node.left +node.element.width();
            case 3:
                return node.left;
        }
    }

    getY(button, node) {
        switch (button) {
            case 1:
                return node.top;
            case 2:
            case 3:
                return node.top + node.element.height() / 2;
            case 4:
                return node.top + node.element.height();
        }
    }

    get x1() {
        return this.getX(this.buttonFrom, this.nodeFrom);
    }

    get y1() {
        return this.getY(this.buttonFrom, this.nodeFrom);
    }

    get x2() {
        return this.getX(this.buttonTo, this.nodeTo);
    }

    get y2() {
        return this.getY(this.buttonTo, this.nodeTo);
    }

    updateCoordinates() {
        this.element.attr({
            x1: this.x1,
            y1: this.y1,
            x2: this.x2,
            y2: this.y2
        });
    }
}

class Lines {
    constructor() {
        this.items = [];
        this.nextID = 0;
    }

    add(item) {
        this.items.push(item);
        this.nextID++;
    }

    updateCoordinates() {
        this.items.forEach(item => item.updateCoordinates());
    }
}

function addNode(nodeID, button) {
    let node = nodes.getItem(nodeID);

    if (node.relations[button].nodeID !== null) {
        return;
    }

    let left = node.left, top = node.top;
    if (button === 1) {
        top -= offset;
    } else if (button === 2) {
        left += offset;
    } else if (button === 3) {
        left -= offset;
    } else if (button === 4) {
        top += offset;
    }

    let newNode = new NodeElement(nodes.nextID, left, top);

    node.addRelation(button, newNode.id);
    node.getButton(button).addClass('related');

    const buttonRelations = {
        1: 4,
        2: 3,
        3: 2,
        4: 1
    };

    newNode.addRelation(buttonRelations[button], node.id);
    newNode.getButton(buttonRelations[button]).addClass('related');
    nodes.add(newNode);

    lines.add(new Line(lines.nextID, node, button, newNode, buttonRelations[button]));
}

function deleteNode(nodeID) {
    let node = nodes.getItem(nodeID);
}

const offset = 150;

let nodes = new Nodes(),
    lines = new Lines();
nodes.add(new NodeElement(nodes.nextID, 670, 300));
