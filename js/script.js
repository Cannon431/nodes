'use strict';

class NodeItem {
    title = '';
    relations = {
        1: {nodeID: null, title: ''},
        2: {nodeID: null, title: ''},
        3: {nodeID: null, title: ''},
        4: {nodeID: null, title: ''}
    };

    constructor(id, left, top) {
        this.id = id;

        this.createElement();

        this.top = top;
        this.left = left;
    }

    createElement() {
        this.element = $(`
            <div class="node" id="node-${this.id}" data-id="${this.id}" oncontextmenu="removeNode(${this.id});return false;">
                <div class="buttons">
                    <div class="button button-1" onclick="addNode(${this.id}, 1)"><div>1</div></div>
                    <div class="button button-2" onclick="addNode(${this.id}, 2)"><div>2</div></div>
                    <div class="button button-3" onclick="addNode(${this.id}, 3)"><div>3</div></div>
                    <div class="button button-4" onclick="addNode(${this.id}, 4)"><div>4</div></div>
                </div>
                <button class="control-button control-button-x" onclick="removeNode(${this.id})">&times;</button>
                <button class="control-button control-button-e" onclick="openEditor(${this.id})">e</button>
            </div>`);

        this.makeDraggable();

        this.element.hide();
        $('#nodes').append(this.element);
        this.element.fadeIn();
    }

    makeDraggable() {
        let self = this;
        this.element.draggable({
            start() {
                self.element.addClass('dragging');
                self.element.find('.buttons').hide();
                self.element.find('.control-button').hide();
                self.element.find('.control-button').hide();
            },

            drag() {
                self.left = $(this).css('left');
                self.top = $(this).css('top');

                lines.updateCoordinates();
            },

            stop() {
                self.element.removeClass('dragging');
                self.element.find('.buttons').show();
                self.element.find('.control-button').show();
                self.element.find('.control-button').attr('style', '');

                self.left = $(this).css('left');
                self.top = $(this).css('top');

                lines.updateCoordinates();
            }
        }).css('position', 'absolute');
    }

    removeElement() {
        this.element.fadeOut(() => this.element.remove());
    }

    getButton(number) {
        return this.element.find('.buttons').children().eq(number - 1);
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

class NodesCollection {
    items = [];
    nextID = 0;

    add(item) {
        this.items.push(item);
        this.nextID++;
    }

    get(id) {
        let item = this.items.find(item => item.id === id);

        if (item === undefined) {
            throw new Error(`Node with id ${id} not found`);
        }

        return item;
    }

    remove(id) {
        let itemIndex = this.items.findIndex(item => item.id === id);

        if (itemIndex === -1) {
            throw new Error(`Node with id ${id} not found`);
        }

        return this.items.splice(itemIndex, 1)[0];
    }
}

class LineItem {
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

        this.element.hide();
        $('#lines').append(this.element);
        this.element.fadeIn(500);
    }

    removeElement() {
        this.element.fadeOut(500, () => this.element.remove());
    }

    getX(button, node) {
        switch (button) {
            case 1:
            case 4:
                return node.left + node.element.outerWidth() / 2;
            case 2:
                return node.left +node.element.outerWidth();
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
                return node.top + node.element.outerHeight() / 2;
            case 4:
                return node.top + node.element.outerHeight();
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

class LinesCollection {
    items = [];
    nextID = 0;

    add(item) {
        this.items.push(item);
        this.nextID++;
    }

    updateCoordinates() {
        this.items.forEach(item => item.updateCoordinates());
    }
}

function changeMode(e) {
    isDesignMode = !isDesignMode;

    if (isDesignMode) {
        // Меняем на режим design
        $(e.target).html('Presentation mode');
    } else {
        // Меняем на режим просмотра
        $(e.target).html('Design mode');
        updatePresentationWindow();
    }

    $('#design-mode').toggle();
    $('#presentation-mode').toggle();
}

function addNode(nodeID, button) {
    let node = nodes.get(nodeID);

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

    let newNode = new NodeItem(nodes.nextID, left, top);

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

    lines.add(new LineItem(lines.nextID, node, button, newNode, buttonRelations[button]));
}

function removeNode(nodeID) {
    if (nodes.items.length < 2) {
        alert('Single node cannot be deleted');

        return;
    }

    let node = nodes.remove(nodeID);
    node.removeElement();

    nodes.items.forEach(item => {
        for (let button in item.relations) {
            if (item.relations[button].nodeID === nodeID) {
                item.relations[button].nodeID = null;
                item.relations[button].title = '';
                item.getButton(button).removeClass('related');
            }
        }
    });

    lines.items = lines.items.filter(item => {
        if (item.nodeFrom.id === nodeID || item.nodeTo.id === nodeID) {
            item.removeElement();

            return false;
        }

        return true;
    });

    viewingNode = nodes.items[0];
}

function openEditor(nodeID) {
    let node = nodes.get(nodeID);
    editingNode = node;

    $('#node-title').val(node.title);
 
    for (let button in node.relations) {
        if (node.relations[button].nodeID === null) {
            $(`#node-relation-${button}`).hide();
        } else {
            $(`#node-relation-${button}`).val(node.relations[button].title);
            $(`#node-relation-${button}`).show();
        }
    }

    $('#edit-dialog').dialog('open');
}

function nextNode(button) {
    viewingNode = nodes.get(viewingNode.relations[button].nodeID);
    updatePresentationWindow();
}

function updatePresentationWindow() {
    $('#presentation-mode-title').html(`Node with id ${viewingNode.id} ${viewingNode.title}`);
    
    for (let button in viewingNode.relations) {
        let buttonElement = $(`#to-relation-${button}`),
            relation = viewingNode.relations[button];

        if (relation.nodeID === null) {
            buttonElement.hide();
        } else {

            buttonElement.html(`Relation ${button}` + (relation.title !== '' ? ` - ${relation.title}`: ''));
            buttonElement.show();
        }
    }
}

$(document).on('contextmenu', e => e.preventDefault());
$('#presentation-mode').hide();
$('#node-title').ckeditor();
$('#edit-dialog').dialog({
    width: 900,
    resizable: false,
    autoOpen: false,
    draggable: false,
    buttons: [
        {
            text: 'OK',
            click() {
                editingNode.title = $('#node-title').val();
                for (let button in editingNode.relations) {
                    if (editingNode.relations[button].nodeID !== null) {
                        editingNode.relations[button].title = $(`#node-relation-${button}`).val();
                    }
                }

                editingNode = null;
                $(this).dialog('close');
            }
        }
    ]
});

let isDesignMode = true;

const offset = 150;

let nodes = new NodesCollection(), lines = new LinesCollection();
nodes.add(new NodeItem(nodes.nextID, 670, 300));

let editingNode = null, viewingNode = nodes.items[0];
