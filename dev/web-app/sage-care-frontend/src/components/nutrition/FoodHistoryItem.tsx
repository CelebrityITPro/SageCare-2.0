import React from 'react';
import {
  Card,
  CardBody,
  HStack,
  VStack,
  Box,
  Text,
  Image,
  Badge,
  Icon,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiInfo } from 'react-icons/fi';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface MealEntry {
  id: string;
  date: string;
  mealType: string;
  imageUrl: string;
  nutritionData: NutritionData;
  notes?: string;
  confidence?: number;
  foodItems?: string[];
}

interface FoodHistoryItemProps {
  entry: MealEntry;
  onViewDetails: (entry: MealEntry) => void;
}

const FoodHistoryItem: React.FC<FoodHistoryItemProps> = ({ entry, onViewDetails }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'orange';
      case 'lunch': return 'green';
      case 'dinner': return 'purple';
      case 'snack': return 'blue';
      default: return 'gray';
    }
  };

  const getCalorieColor = (calories: number) => {
    if (calories < 300) return 'green';
    if (calories < 600) return 'yellow';
    return 'red';
  };

  return (
    <Card 
      cursor="pointer" 
      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
      transition="all 0.2s"
      onClick={() => onViewDetails(entry)}
    >
      <CardBody>
        <HStack spacing={4} align="start">
          {/* Food Image */}
          <Box flexShrink={0}>
            <Image
              src={entry.imageUrl}
              alt="Food"
              boxSize="80px"
              objectFit="cover"
              borderRadius="md"
              fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyMEMyOS4wNTQ0IDIwIDIwIDI5LjA1NDQgMjAgNDBDMjAgNTAuOTQ1NiAyOS4wNTQ0IDYwIDQwIDYwQzUwLjk0NTYgNjAgNjAgNTAuOTQ1NiA2MCA0MEM2MCAyOS4wNTQ0IDUwLjk0NTYgMjAgNDAgMjBaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0zNSAzNUg0NVY0NUgzNVYzNVoiIGZpbGw9IiM5OTkiLz4KPC9zdmc+"
            />
          </Box>

          {/* Content */}
          <VStack align="start" flex={1} spacing={2}>
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold" fontSize="lg">
                {entry.foodItems?.[0] || 'Analyzed Food'}
              </Text>
              <Badge colorScheme={getMealTypeColor(entry.mealType)}>
                {entry.mealType.charAt(0).toUpperCase() + entry.mealType.slice(1)}
              </Badge>
            </HStack>

            {/* Date and Time */}
            <HStack spacing={2} color="gray.600" fontSize="sm">
              <Icon as={FiCalendar} />
              <Text>{formatDate(entry.date)}</Text>
            </HStack>

            {/* Nutrition Summary */}
            <HStack spacing={4} fontSize="sm">
              <Box>
                <Text color="gray.600">Calories</Text>
                <Text fontWeight="semibold" color={getCalorieColor(entry.nutritionData.calories)}>
                  {entry.nutritionData.calories}
                </Text>
              </Box>
              <Box>
                <Text color="gray.600">Protein</Text>
                <Text fontWeight="semibold">{entry.nutritionData.protein}g</Text>
              </Box>
              <Box>
                <Text color="gray.600">Carbs</Text>
                <Text fontWeight="semibold">{entry.nutritionData.carbs}g</Text>
              </Box>
              <Box>
                <Text color="gray.600">Fat</Text>
                <Text fontWeight="semibold">{entry.nutritionData.fat}g</Text>
              </Box>
            </HStack>

            {/* Confidence Score */}
            {entry.confidence && (
              <HStack spacing={2}>
                <Icon as={FiInfo} color="blue.500" />
                <Text fontSize="sm" color="gray.600">
                  Confidence: {(entry.confidence * 100).toFixed(1)}%
                </Text>
              </HStack>
            )}

            {/* Notes */}
            {entry.notes && (
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {entry.notes}
              </Text>
            )}
          </VStack>

          {/* View Details Button */}
          <Button
            size="sm"
            variant="ghost"
            colorScheme="brand"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(entry);
            }}
          >
            View Details
          </Button>
        </HStack>
      </CardBody>
    </Card>
  );
};

export default FoodHistoryItem; 