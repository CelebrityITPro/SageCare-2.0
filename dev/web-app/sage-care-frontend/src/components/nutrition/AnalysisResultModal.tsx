import React, { useState } from 'react';
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Progress,
  Divider,
  useToast
} from '@chakra-ui/react';
import { FiInfo, FiCheckCircle, FiAlertCircle, FiStar } from 'react-icons/fi';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  foodItems: string[];
  confidence: number;
  tips?: string[];
}

interface AnalysisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  nutritionData: NutritionData | null;
  previewUrl: string;
  onSave: (mealType: string, notes: string) => void;
  isSaving: boolean;
}

const AnalysisResultModal: React.FC<AnalysisResultModalProps> = ({
  isOpen,
  onClose,
  nutritionData,
  previewUrl,
  onSave,
  isSaving
}) => {
  const [mealType, setMealType] = useState('lunch');
  const [notes, setNotes] = useState('');
  const [accuracyRating, setAccuracyRating] = useState(0);
  const toast = useToast();

  const handleSave = () => {
    if (!nutritionData) return;
    
    onSave(mealType, notes);
    toast({
      title: "Analysis Saved",
      description: "Your food analysis has been saved successfully!",
      status: "success",
      duration: 3000,
      isClosable: true,
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

  if (!nutritionData) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="xl" p="0" maxH="90vh">
        <ModalHeader borderTopRadius="xl" bg="brand.50" color="brand.900" fontWeight="bold">
          Analysis Results
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6} maxH="calc(90vh - 140px)" overflowY="auto">
          <VStack spacing={6} align="stretch">
            {/* Food Image */}
            {previewUrl && (
              <Box textAlign="center">
                <Image
                  src={previewUrl}
                  alt="Food preview"
                  maxH="300px"
                  objectFit="contain"
                  borderRadius="md"
                />
              </Box>
            )}

            {/* Food Identification */}
            <Box>
              <HStack justify="space-between" align="center" mb={2}>
                <Text fontWeight="bold" fontSize="lg">
                  {nutritionData.foodItems?.[0]?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Analyzed Food'}
                </Text>
                <Badge 
                  colorScheme={getConfidenceColor(nutritionData.confidence)}
                  fontSize="sm"
                >
                  {(nutritionData.confidence * 100).toFixed(1)}% Confidence
                </Badge>
              </HStack>
              <Progress 
                value={nutritionData.confidence * 100} 
                colorScheme={getConfidenceColor(nutritionData.confidence)}
                size="sm"
              />
            </Box>

            {/* Nutrition Information */}
            <Box>
              <Text fontWeight="semibold" mb={3}>Nutrition Information:</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Calories</Text>
                  <Text fontWeight="bold" color={getCalorieColor(nutritionData.calories)}>
                    {nutritionData.calories}
                  </Text>
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Protein</Text>
                  <Text fontWeight="bold">{nutritionData.protein}g</Text>
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Carbohydrates</Text>
                  <Text fontWeight="bold">{nutritionData.carbs}g</Text>
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Fat</Text>
                  <Text fontWeight="bold">{nutritionData.fat}g</Text>
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Fiber</Text>
                  <Text fontWeight="bold">{nutritionData.fiber}g</Text>
                </Box>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600">Sugar</Text>
                  <Text fontWeight="bold">{nutritionData.sugar}g</Text>
                </Box>
              </Grid>
            </Box>

            {/* Recommendations */}
            {nutritionData.tips && nutritionData.tips.length > 0 && (
              <Box>
                <Accordion allowToggle>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="semibold">Health Recommendations</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <VStack spacing={3} align="stretch">
                        {nutritionData.tips.map((tip, index) => (
                          <HStack key={index} spacing={3} p={3} bg="blue.50" borderRadius="md">
                            <Icon as={FiInfo} color="blue.500" />
                            <Text fontSize="sm" color="blue.700">{tip}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Box>
            )}

            <Divider />

            {/* Save Options */}
            <Box>
              <Text fontWeight="semibold" mb={3}>Save Analysis:</Text>
              <VStack spacing={3} align="stretch">
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Meal Type:</Text>
                  <select 
                    value={mealType} 
                    onChange={(e) => setMealType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px'
                    }}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </Box>
                
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Notes (Optional):</Text>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this meal..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </Box>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        <Box p={6} borderTop="1px solid" borderColor="gray.200">
          <HStack spacing={4} justify="flex-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleSave}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              Save Analysis
            </Button>
          </HStack>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default AnalysisResultModal; 