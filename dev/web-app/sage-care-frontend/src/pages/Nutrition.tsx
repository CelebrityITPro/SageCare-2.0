import React, { useState, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Image,
  useToast,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Progress,
  Badge,
  Icon,
  Flex,
  Grid,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  Textarea,
  Select,
  Divider,
} from "@chakra-ui/react";
import {
  FiCamera,
  FiUpload,
  FiTrendingUp,
  FiTarget,
  FiBarChart,
  FiCalendar,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiClock,
  FiStar,
} from "react-icons/fi";
import AnalysisResultModal from '../components/nutrition/AnalysisResultModal';
import FoodHistoryItem from '../components/nutrition/FoodHistoryItem';
import FoodDetailModal from '../components/nutrition/FoodDetailModal';
import RecommendationsList from '../components/nutrition/RecommendationsList';


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

interface DietPlan {
  id: string;
  name: string;
  type: "weight-loss" | "muscle-gain" | "maintenance" | "diabetic" | "heart-healthy";
  dailyCalories: number;
  description: string;
  duration: number; // in days
  isActive: boolean;
  startDate: string;
}

interface MealEntry {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  imageUrl?: string;
  nutritionData: NutritionData;
  notes?: string;
}

const Nutrition = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MealEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState("6865b7a445c5856a18f596a6"); // Default user ID
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { isOpen: isDietPlanModalOpen, onOpen: onDietPlanModalOpen, onClose: onDietPlanModalClose } = useDisclosure();

  // Fetch nutrition history from database
  const fetchNutritionHistory = async () => {
    try {
      // Try to get user ID from localStorage first, fallback to default
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const localStorageUserId = user._id;
      
      if (localStorageUserId) {
        setUserId(localStorageUserId);
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://sagecare-api:5000/api'}/nutrition/history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Convert database entries to MealEntry format
        const entries: MealEntry[] = data.history.map((entry: any) => ({
          id: entry._id,
          date: entry.date,
          mealType: entry.mealType,
          imageUrl: `/api/nutrition/entry/${entry._id}/image`, // URL to fetch image
          nutritionData: {
            ...entry.nutrition,
            foodItems: entry.foodItems || []
          },
          notes: entry.notes
        }));
        setMealEntries(entries);
      }
    } catch (error) {
      console.error('Failed to fetch nutrition history:', error);
    }
  };

  // Fetch history on component mount
  React.useEffect(() => {
    fetchNutritionHistory();
  }, [userId]);

  // Food analysis function using Food-101 inference server
  const analyzeFoodImage = async (imageFile: File): Promise<NutritionData> => {
    try {
      // Import the food analysis function
      const { analyzeFoodImage: analyzeFood, convertToNutritionData } = await import('../api/food');
      
      // Analyze the image using the Food-101 inference server
      const analysisResult = await analyzeFood(imageFile);
      
      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }
      
      // Convert to the format expected by the frontend
      const nutritionData = convertToNutritionData(analysisResult);
      return nutritionData;
    } catch (error) {
      console.error('Food analysis error:', error);
      throw error;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowUploadModal(true);
    }
  };

  const handleAnalyzeFood = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeFoodImage(selectedImage);
      setNutritionData(analysis);
      setShowAnalysisModal(true);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the food image. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAnalysis = async (mealType: string, notes: string) => {
    if (!nutritionData || !selectedImage) return;
    
    setIsSaving(true);
    try {
      // Create FormData to send image and data to backend
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('userId', userId);
      formData.append('mealType', mealType);
      formData.append('notes', notes);
      
      // Save to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://sagecare-api:5000/api'}/nutrition/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to save analysis');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Add to meal entries with the backend-generated ID
        const newEntry: MealEntry = {
          id: result.entryId,
          date: new Date().toISOString(),
          mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
          imageUrl: `/api/nutrition/entry/${result.entryId}/image`,
          nutritionData: nutritionData,
          notes: notes
        };
        
        setMealEntries(prev => [newEntry, ...prev]);
        
        toast({
          title: "Success",
          description: "Food analysis saved successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Reset form
        setSelectedImage(null);
        setPreviewUrl('');
        setNutritionData(null);
        setShowAnalysisModal(false);
        setShowUploadModal(false);
      } else {
        throw new Error(result.error || 'Failed to save analysis');
      }
    } catch (error) {
      console.error('Failed to save analysis:', error);
      toast({
        title: "Error",
        description: "Failed to save analysis. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDetails = (entry: MealEntry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const handleDeleteEntry = (entryId: string) => {
    setMealEntries(prev => prev.filter(entry => entry.id !== entryId));
    setShowDetailModal(false);
    setSelectedEntry(null);
  };

  const getDailyNutrition = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = mealEntries.filter(entry => 
      entry.date.startsWith(today)
    );
    
    return todayEntries.reduce((total, entry) => ({
      calories: total.calories + entry.nutritionData.calories,
      protein: total.protein + entry.nutritionData.protein,
      carbs: total.carbs + entry.nutritionData.carbs,
      fat: total.fat + entry.nutritionData.fat,
      fiber: total.fiber + entry.nutritionData.fiber,
      sugar: total.sugar + entry.nutritionData.sugar,
      sodium: total.sodium + entry.nutritionData.sodium,
    }), {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0
    });
  };

  const getNutritionRecommendations = () => {
    const daily = getDailyNutrition();
    const recommendations = [];

    if (daily.calories < 1200) {
      recommendations.push("Consider adding more calories to meet your daily needs");
    } else if (daily.calories > 2500) {
      recommendations.push("Your calorie intake is high. Consider portion control");
    }

    if (daily.protein < 50) {
      recommendations.push("Increase protein intake for better muscle health");
    }

    if (daily.fiber < 25) {
      recommendations.push("Add more fiber-rich foods for better digestion");
    }

    if (daily.sugar > 50) {
      recommendations.push("Consider reducing sugar intake for better health");
    }

    return recommendations.length > 0 ? recommendations : ["Great job! Your nutrition is well-balanced."];
  };

  const renderNutritionCard = (entry: MealEntry) => (
    <Card key={entry.id} variant="outline" mb={4}>
      <CardBody>
        <HStack spacing={4} align="start">
          {entry.imageUrl && (
            <Image
              src={entry.imageUrl}
              alt="Food"
              boxSize="80px"
              objectFit="cover"
              borderRadius="md"
            />
          )}
          <Box flex={1}>
            <HStack justify="space-between" mb={2}>
              <Badge colorScheme="blue" variant="subtle">
                {entry.mealType}
              </Badge>
              <Text fontSize="sm" color="gray.500">
                {new Date(entry.date).toLocaleDateString()}
              </Text>
            </HStack>
            
            <Text fontWeight="semibold" mb={2}>
              {entry.nutritionData.foodItems?.join(", ") || "No food items detected"}
            </Text>
            
            <HStack spacing={4} fontSize="sm" color="gray.600">
              <Text>{entry.nutritionData.calories} cal</Text>
              <Text>{entry.nutritionData.protein}g protein</Text>
              <Text>{entry.nutritionData.carbs}g carbs</Text>
              <Text>{entry.nutritionData.fat}g fat</Text>
            </HStack>
            
            {entry.notes && (
              <Text fontSize="sm" color="gray.500" mt={2}>
                {entry.notes}
              </Text>
            )}
          </Box>
        </HStack>
      </CardBody>
    </Card>
  );

  return (
    <Box w="full">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Your Nutrition
          </Heading>
          <Text color="gray.600">
            Track your meals, analyze nutrition, and get personalized recommendations
          </Text>
        </Box>

        {/* Quick Actions */}
        <HStack spacing={4}>
          <Button
            colorScheme="brand"
            leftIcon={<Icon as={FiCamera} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Analyze Food
          </Button>
          <Button
            variant="outline"
            leftIcon={<Icon as={FiPlus} />}
            onClick={onDietPlanModalOpen}
          >
            Start Diet Plan
          </Button>
        </HStack>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme="brand" index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>
              <Icon as={FiBarChart} mr={2} />
              Overview
            </Tab>
            <Tab>
                              <Icon as={FiClock} mr={2} />
              Food History
            </Tab>
            <Tab>
              <Icon as={FiTarget} mr={2} />
              Diet Plans
            </Tab>
            <Tab>
              <Icon as={FiStar} mr={2} />
              Recommendations
            </Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
                <GridItem>
                  <Card>
                    <CardBody>
                      <Heading size="md" mb={4}>Today's Nutrition</Heading>
                      {mealEntries.length === 0 ? (
                        <Box textAlign="center" py={8}>
                          <Icon as={FiCamera} size="48px" color="gray.400" mb={4} />
                          <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
                            No meals tracked today
                          </Text>
                          <Text color="gray.500" mb={4}>
                            Upload a food image to start tracking your nutrition
                          </Text>
                          <Button colorScheme="brand" onClick={() => fileInputRef.current?.click()}>
                            Upload Food Image
                          </Button>
                        </Box>
                      ) : (
                        <VStack spacing={4} align="stretch">
                          {mealEntries.slice(0, 3).map(renderNutritionCard)}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem>
                  <VStack spacing={4} align="stretch">
                    {/* Daily Summary */}
                    <Card>
                      <CardBody>
                        <Heading size="sm" mb={4}>Daily Summary</Heading>
                        <VStack spacing={3} align="stretch">
                          <Box>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm">Calories</Text>
                              <Text fontSize="sm" fontWeight="semibold">
                                {getDailyNutrition().calories} / 2000
                              </Text>
                            </HStack>
                            <Progress value={(getDailyNutrition().calories / 2000) * 100} colorScheme="brand" size="sm" />
                          </Box>
                          
                          <Box>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm">Protein</Text>
                              <Text fontSize="sm" fontWeight="semibold">
                                {getDailyNutrition().protein}g / 50g
                              </Text>
                            </HStack>
                            <Progress value={(getDailyNutrition().protein / 50) * 100} colorScheme="green" size="sm" />
                          </Box>
                          
                          <Box>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm">Carbs</Text>
                              <Text fontSize="sm" fontWeight="semibold">
                                {getDailyNutrition().carbs}g / 250g
                              </Text>
                            </HStack>
                            <Progress value={(getDailyNutrition().carbs / 250) * 100} colorScheme="orange" size="sm" />
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Quick Recommendations */}
                    <Card>
                      <CardBody>
                        <Heading size="sm" mb={4}>Recommendations</Heading>
                        <VStack spacing={2} align="stretch">
                          {getNutritionRecommendations().map((rec, index) => (
                            <HStack key={index} spacing={2}>
                              <Icon as={FiInfo} color="brand.500" />
                              <Text fontSize="sm" color="gray.600">{rec}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </GridItem>
              </Grid>
            </TabPanel>

            {/* Food History Tab */}
            <TabPanel>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Food History</Heading>
                  {mealEntries.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Icon as={FiClock} size="48px" color="gray.400" mb={4} />
                      <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                        No food analyses yet
                      </Text>
                      <Text color="gray.500">
                        Start by uploading a food image to track your nutrition
                      </Text>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {mealEntries.map((entry) => (
                        <FoodHistoryItem
                          key={entry.id}
                          entry={entry}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Diet Plans Tab */}
            <TabPanel>
              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Diet Plans</Heading>
                    <Button size="sm" colorScheme="brand" onClick={onDietPlanModalOpen}>
                      Create Plan
                    </Button>
                  </HStack>
                  
                  {dietPlans.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Icon as={FiTarget} size="48px" color="gray.400" mb={4} />
                      <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                        No diet plans yet
                      </Text>
                      <Text color="gray.500" mb={4}>
                        Create a personalized diet plan to reach your health goals
                      </Text>
                      <Button colorScheme="brand" onClick={onDietPlanModalOpen}>
                        Create Your First Plan
                      </Button>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {dietPlans.map(plan => (
                        <Card key={plan.id} variant="outline">
                          <CardBody>
                            <HStack justify="space-between" align="start">
                              <Box flex={1}>
                                <HStack spacing={2} mb={2}>
                                  <Text fontWeight="semibold">{plan.name}</Text>
                                  <Badge colorScheme={plan.isActive ? "green" : "gray"}>
                                    {plan.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </HStack>
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                  {plan.description}
                                </Text>
                                <HStack spacing={4} fontSize="sm" color="gray.500">
                                  <Text>{plan.dailyCalories} cal/day</Text>
                                  <Text>{plan.duration} days</Text>
                                  <Text>{plan.type}</Text>
                                </HStack>
                              </Box>
                              <HStack spacing={2}>
                                <Button size="sm" variant="outline">
                                  <Icon as={FiEdit} />
                                </Button>
                                <Button size="sm" variant="outline" colorScheme="red">
                                  <Icon as={FiTrash2} />
                                </Button>
                              </HStack>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Recommendations Tab */}
            <TabPanel>
              <RecommendationsList userId={userId} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" p="0">
          <ModalHeader borderTopRadius="xl" bg="brand.50" color="brand.900" fontWeight="bold">
            {nutritionData ? 'Analysis Results' : 'Analyze Food Image'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <VStack spacing={6} align="stretch">
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
              
              {nutritionData ? (
                // Show analysis results
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="bold" fontSize="lg" mb={2}>
                      {nutritionData.foodItems?.[0]?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Analyzed Food'}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                      Confidence: {(nutritionData.confidence * 100).toFixed(1)}%
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Nutrition Information:</Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={3} fontSize="sm">
                      <Box>
                        <Text color="gray.600">Calories</Text>
                        <Text fontWeight="semibold">{nutritionData.calories}</Text>
                      </Box>
                      <Box>
                        <Text color="gray.600">Protein</Text>
                        <Text fontWeight="semibold">{nutritionData.protein}g</Text>
                      </Box>
                      <Box>
                        <Text color="gray.600">Carbs</Text>
                        <Text fontWeight="semibold">{nutritionData.carbs}g</Text>
                      </Box>
                      <Box>
                        <Text color="gray.600">Fat</Text>
                        <Text fontWeight="semibold">{nutritionData.fat}g</Text>
                      </Box>
                      <Box>
                        <Text color="gray.600">Fiber</Text>
                        <Text fontWeight="semibold">{nutritionData.fiber}g</Text>
                      </Box>
                      <Box>
                        <Text color="gray.600">Sugar</Text>
                        <Text fontWeight="semibold">{nutritionData.sugar}g</Text>
                      </Box>
                    </Grid>
                  </Box>
                  
                  {nutritionData.tips && nutritionData.tips.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Health Tips:</Text>
                      <VStack spacing={2} align="stretch">
                        {nutritionData.tips.map((tip, index) => (
                          <HStack key={index} spacing={2} p={3} bg="blue.50" borderRadius="md">
                            <Icon as={FiInfo} color="blue.500" />
                            <Text fontSize="sm" color="blue.700">{tip}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              ) : (
                // Show analysis features
                <Box>
                  <Text fontWeight="semibold" mb={2}>What we'll analyze:</Text>
                  <VStack spacing={2} align="stretch" fontSize="sm" color="gray.600">
                    <HStack spacing={2}>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text>Food identification using AI</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text>Calorie and macronutrient content</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text>Nutritional analysis</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text>Personalized health tips</Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <Box p={6} borderTop="1px solid" borderColor="gray.200">
            <HStack spacing={4} justify="flex-end">
              <Button variant="ghost" onClick={() => {
                setShowUploadModal(false);
                setNutritionData(null);
              }}>
                {nutritionData ? 'Close' : 'Cancel'}
              </Button>
              {!nutritionData && (
                <Button
                  colorScheme="brand"
                  onClick={handleAnalyzeFood}
                  isLoading={isAnalyzing}
                  loadingText="Analyzing..."
                >
                  Analyze Food
                </Button>
              )}
            </HStack>
          </Box>
        </ModalContent>
      </Modal>

      {/* Diet Plan Modal */}
      <Modal isOpen={isDietPlanModalOpen} onClose={onDietPlanModalClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" p="0">
          <ModalHeader borderTopRadius="xl" bg="brand.50" color="brand.900" fontWeight="bold">
            Create Diet Plan
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={2}>Plan Name</Text>
                <Input placeholder="e.g., Weight Loss Plan" />
              </Box>
              
              <Box>
                <Text fontWeight="semibold" mb={2}>Plan Type</Text>
                <Select placeholder="Select plan type">
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="diabetic">Diabetic</option>
                  <option value="heart-healthy">Heart Healthy</option>
                </Select>
              </Box>
              
              <Box>
                <Text fontWeight="semibold" mb={2}>Daily Calories</Text>
                <Input type="number" placeholder="2000" />
              </Box>
              
              <Box>
                <Text fontWeight="semibold" mb={2}>Duration (days)</Text>
                <Input type="number" placeholder="30" />
              </Box>
              
              <Box>
                <Text fontWeight="semibold" mb={2}>Description</Text>
                <Textarea placeholder="Describe your goals and preferences..." rows={3} />
              </Box>
            </VStack>
          </ModalBody>
          <Box p={6} borderTop="1px solid" borderColor="gray.200">
            <HStack spacing={4} justify="flex-end">
              <Button variant="ghost" onClick={onDietPlanModalClose}>
                Cancel
              </Button>
              <Button colorScheme="brand">
                Create Plan
              </Button>
            </HStack>
          </Box>
        </ModalContent>
      </Modal>

      {/* Analysis Result Modal */}
      <AnalysisResultModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        nutritionData={nutritionData}
        previewUrl={previewUrl}
        onSave={handleSaveAnalysis}
        isSaving={isSaving}
      />

      {/* Food Detail Modal */}
      <FoodDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        entry={selectedEntry}
        onDelete={handleDeleteEntry}
      />
    </Box>
  );
};

export default Nutrition; 