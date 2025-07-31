import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Image,
  Grid,
  Badge,
  Progress,
  Divider,
  Icon,
  useToast
} from '@chakra-ui/react';
import { FiInfo, FiCalendar, FiClock, FiEdit, FiTrash2 } from 'react-icons/fi';

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
  recommendations?: string[];
}

interface FoodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: MealEntry | null;
  onEdit?: (entry: MealEntry) => void;
  onDelete?: (entryId: string) => void;
}

const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  isOpen,
  onClose,
  entry,
  onEdit,
  onDelete
}) => {
  const toast = useToast();

  if (!entry) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'yellow';
    return 'red';
  };

  const getCalorieColor = (calories: number) => {
    if (calories < 300) return 'green';
    if (calories < 600) return 'yellow';
    return 'red';
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

  const handleDelete = () => {
    if (onDelete) {
      onDelete(entry.id);
      toast({
        title: "Entry Deleted",
        description: "The food analysis entry has been deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="xl" p="0" maxH="90vh">
        <ModalHeader borderTopRadius="xl" bg="brand.50" color="brand.900" fontWeight="bold">
          Food Analysis Details
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6} maxH="calc(90vh - 140px)" overflowY="auto">
          <VStack spacing={6} align="stretch">
            {/* Header Info */}
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="xl">
                  {entry.foodItems?.[0] || 'Analyzed Food'}
                </Text>
                <HStack spacing={2} color="gray.600" fontSize="sm">
                  <Icon as={FiCalendar} />
                  <Text>{formatDate(entry.date)}</Text>
                </HStack>
              </VStack>
              <Badge colorScheme={getMealTypeColor(entry.mealType)} size="lg">
                {entry.mealType.charAt(0).toUpperCase() + entry.mealType.slice(1)}
              </Badge>
            </HStack>

            {/* Food Image */}
            <Box textAlign="center">
              <Image
                src={entry.imageUrl}
                alt="Food"
                maxH="300px"
                objectFit="contain"
                borderRadius="md"
                fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgNTBDMTE2Ljg2MiA1MCA5MCA2Ni44NjIgOTAgMTAwQzkwIDEzMy4xMzggMTE2Ljg2MiAxNTAgMTUwIDE1MEMxODMuMTM4IDE1MCAyMTAgMTMzLjEzOCAyMTAgMTAwQzIxMCA2Ni44NjIgMTgzLjEzOCA1MCAxNTAgNTBaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0xMzAgOTBIMTcwVjExMEgxMzBWOTBaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPg=="
              />
            </Box>

            {/* Confidence Score */}
            {entry.confidence && (
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="semibold">Analysis Confidence</Text>
                  <Badge colorScheme={getConfidenceColor(entry.confidence)}>
                    {(entry.confidence * 100).toFixed(1)}%
                  </Badge>
                </HStack>
                <Progress 
                  value={entry.confidence * 100} 
                  colorScheme={getConfidenceColor(entry.confidence)}
                  size="lg"
                />
              </Box>
            )}

            <Divider />

            {/* Nutrition Information */}
            <Box>
              <Text fontWeight="semibold" fontSize="lg" mb={4}>Nutrition Information</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Calories</Text>
                  <Text fontWeight="bold" fontSize="xl" color={getCalorieColor(entry.nutritionData.calories)}>
                    {entry.nutritionData.calories}
                  </Text>
                </Box>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Protein</Text>
                  <Text fontWeight="bold" fontSize="xl">{entry.nutritionData.protein}g</Text>
                </Box>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Carbohydrates</Text>
                  <Text fontWeight="bold" fontSize="xl">{entry.nutritionData.carbs}g</Text>
                </Box>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Fat</Text>
                  <Text fontWeight="bold" fontSize="xl">{entry.nutritionData.fat}g</Text>
                </Box>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Fiber</Text>
                  <Text fontWeight="bold" fontSize="xl">{entry.nutritionData.fiber}g</Text>
                </Box>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Sugar</Text>
                  <Text fontWeight="bold" fontSize="xl">{entry.nutritionData.sugar}g</Text>
                </Box>
              </Grid>
            </Box>

            {/* Recommendations */}
            {entry.recommendations && entry.recommendations.length > 0 && (
              <Box>
                <Text fontWeight="semibold" fontSize="lg" mb={3}>Health Recommendations</Text>
                <VStack spacing={3} align="stretch">
                  {entry.recommendations.map((recommendation, index) => (
                    <HStack key={index} spacing={3} p={4} bg="blue.50" borderRadius="md">
                      <Icon as={FiInfo} color="blue.500" />
                      <Text fontSize="sm" color="blue.700">{recommendation}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Notes */}
            {entry.notes && (
              <Box>
                <Text fontWeight="semibold" fontSize="lg" mb={3}>Notes</Text>
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.700">{entry.notes}</Text>
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <Box p={6} borderTop="1px solid" borderColor="gray.200">
          <HStack spacing={4} justify="flex-end">
            {onDelete && (
              <Button
                leftIcon={<Icon as={FiTrash2} />}
                colorScheme="red"
                variant="outline"
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
            {onEdit && (
              <Button
                leftIcon={<Icon as={FiEdit} />}
                colorScheme="brand"
                variant="outline"
                onClick={() => onEdit(entry)}
              >
                Edit
              </Button>
            )}
            <Button onClick={onClose}>
              Close
            </Button>
          </HStack>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default FoodDetailModal; 