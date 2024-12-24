import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  TextField, 
  IconButton, 
  Chip, 
  Tooltip, 
  Badge,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
} from '@mui/material';
import { 
  Delete, 
  Edit, 
  Search, 
  FilterList,
  AddCircle,
  Flag,
  CalendarToday,
} from '@mui/icons-material';
import { format } from 'date-fns';

const BackpackContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled(motion.h1)`
  color: #2d3436;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled(motion.p)`
  color: #636e72;
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Input = styled(motion.input)`
  flex: 1;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
  }
`;

const Button = styled(motion.button)`
  padding: 1rem 2rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #45a049;
  }
`;

const ItemsList = styled(motion.ul)`
  list-style: none;
  padding: 0;
`;

const ItemCard = styled(motion.li)`
  background: white;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Category = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-right: 1rem;
  background: ${props => props.color};
  color: white;
`;

const SearchBar = styled(motion.div)`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterContainer = styled(motion.div)`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Backpack = () => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('backpackItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState('essentials');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
  });
  const [editingItem, setEditingItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('backpackItems', JSON.stringify(items));
  }, [items]);

  const categories = {
    essentials: { name: 'Essentials', color: '#4CAF50' },
    electronics: { name: 'Electronics', color: '#2196F3' },
    clothing: { name: 'Clothing', color: '#9C27B0' },
    food: { name: 'Food', color: '#FF9800' },
  };

  const addItem = (e) => {
    e.preventDefault();
    if (newItem.trim() !== '') {
      const newItemObj = {
        id: Date.now(),
        name: newItem.trim(),
        category,
        priority: 3,
        quantity: 1,
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
        createdAt: new Date().toISOString(),
      };
      setItems([newItemObj, ...items]);
      setNewItem('');
    }
  };

  const updateItem = (updatedItem) => {
    setItems(items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
  };

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      const matchesPriority = filters.priority === 'all' || item.priority === parseInt(filters.priority);
      return matchesSearch && matchesCategory && matchesPriority;
    });

  return (
    <BackpackContainer>
      <Title>Backpack</Title>
      <Subtitle>Organize and store your items</Subtitle>

      <SearchBar>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search color="action" />,
          }}
        />
      </SearchBar>

      <FilterContainer>
        <Chip
          icon={<FilterList />}
          label="Category"
          onClick={() => setFilters({ ...filters, category: 'all' })}
          color={filters.category === 'all' ? 'primary' : 'default'}
        />
        {Object.entries(categories).map(([key, { name, color }]) => (
          <Chip
            key={key}
            label={name}
            onClick={() => setFilters({ ...filters, category: key })}
            style={{ backgroundColor: filters.category === key ? color : undefined }}
          />
        ))}
      </FilterContainer>

      <Form onSubmit={addItem}>
        <Input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an item..."
          whileFocus={{ scale: 1.02 }}
        />
        
        <motion.select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: '1rem',
            borderRadius: '12px',
            border: '2px solid #ddd',
          }}
        >
          {Object.entries(categories).map(([key, { name }]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </motion.select>

        <Button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AddCircle /> Add Item
        </Button>
      </Form>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="items">
          {(provided) => (
            <ItemsList
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <AnimatePresence>
                {filteredItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(provided) => (
                      <ItemCard
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        whileHover={{ scale: 1.02 }}
                        layout
                      >
                        <ItemDetails>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Category color={categories[item.category].color}>
                              {categories[item.category].name}
                            </Category>
                            <Badge badgeContent={item.quantity} color="primary">
                              <span>{item.name}</span>
                            </Badge>
                          </div>
                          <Rating
                            value={item.priority}
                            max={5}
                            icon={<Flag fontSize="small" />}
                            onChange={(_, newValue) => {
                              updateItem({ ...item, priority: newValue });
                            }}
                          />
                          <Tooltip title={format(new Date(item.dueDate), 'PPP')}>
                            <CalendarToday fontSize="small" />
                          </Tooltip>
                        </ItemDetails>
                        
                        <ItemActions>
                          <IconButton onClick={() => {
                            setEditingItem(item);
                            setIsDialogOpen(true);
                          }}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => removeItem(item.id)}>
                            <Delete />
                          </IconButton>
                        </ItemActions>
                      </ItemCard>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </AnimatePresence>
            </ItemsList>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          {editingItem && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <TextField
                label="Name"
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              />
              <TextField
                label="Quantity"
                type="number"
                value={editingItem.quantity}
                onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })}
              />
              <TextField
                label="Due Date"
                type="date"
                value={editingItem.dueDate}
                onChange={(e) => setEditingItem({ ...editingItem, dueDate: e.target.value })}
              />
              <TextField
                label="Notes"
                multiline
                rows={4}
                value={editingItem.notes}
                onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setIsDialogOpen(false)}>Cancel</MuiButton>
          <MuiButton onClick={() => updateItem(editingItem)} color="primary">
            Save
          </MuiButton>
        </DialogActions>
      </Dialog>
    </BackpackContainer>
  );
};

export default Backpack;
