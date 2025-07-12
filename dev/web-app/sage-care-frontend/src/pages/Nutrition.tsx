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
} from "react-icons/fi";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { isOpen: isDietPlanModalOpen, onOpen: onDietPlanModalOpen, onClose: onDietPlanModalClose } = useDisclosure();

  // Fetch nutrition history from database
  const fetchNutritionHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;
      
      if (!userId) {
        console.error('No user ID found');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/nutrition/history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Convert database entries to MealEntry format
        const entries: MealEntry[] = data.history.map((entry: any) => ({
          id: entry._id,
          date: entry.date,
          mealType: entry.mealType,
          imageUrl: `/api/nutrition/entry/${entry._id}/image`, // URL to fetch image
          nutritionData: entry.nutrition,
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
  }, []);

  // Mock nutrition analysis function (replace with actual AI API call)
  const analyzeFoodImage = async (imageFile: File): Promise<NutritionData> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('mealType', 'lunch'); // Default meal type
      formData.append('notes', 'Analyzed from uploaded image');
      
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      formData.append('userId', user._id || 'default-user');
      
      const response = await fetch('http://localhost:5000/api/nutrition/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const result = await response.json();
      return result.analysis.nutrition;
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
      
      // The entry is now saved in the database by the API
      // We can fetch the updated list or just add to local state
      const newMealEntry: MealEntry = {
        id: Date.now().toString(), // This will be replaced by the actual DB ID
        date: new Date().toISOString(),
        mealType: "lunch", // Default, could be made selectable
        imageUrl: previewUrl,
        nutritionData: analysis,
        notes: "Analyzed from uploaded image"
      };
      
      setMealEntries(prev => [newMealEntry, ...prev]);
      
      toast({
        title: "Analysis Complete",
        description: "Your food has been analyzed and saved successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
      setShowUploadModal(false);
    }
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
              {entry.nutritionData.foodItems.join(", ")}
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
            <Tab>Overview</Tab>
            <Tab>Meal History</Tab>
            <Tab>Diet Plans</Tab>
            <Tab>Recommendations</Tab>
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

            {/* Meal History Tab */}
            <TabPanel>
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Meal History</Heading>
                  {mealEntries.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Icon as={FiBarChart} size="48px" color="gray.400" mb={4} />
                      <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                        No meals tracked yet
                      </Text>
                      <Text color="gray.500">
                        Start by uploading your first food image
                      </Text>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {mealEntries.map(renderNutritionCard)}
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
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Personalized Recommendations</Heading>
                  <VStack spacing={4} align="stretch">
                    <Box p={4} bg="blue.50" borderRadius="md">
                      <HStack spacing={2} mb={2}>
                        <Icon as={FiTrendingUp} color="blue.500" />
                        <Text fontWeight="semibold" color="blue.700">Nutrition Tips</Text>
                      </HStack>
                      <Text fontSize="sm" color="blue.600">
                        Based on your recent meals, consider adding more leafy greens and whole grains to your diet.
                      </Text>
                    </Box>
                    
                    <Box p={4} bg="green.50" borderRadius="md">
                      <HStack spacing={2} mb={2}>
                        <Icon as={FiCheckCircle} color="green.500" />
                        <Text fontWeight="semibold" color="green.700">Good Habits</Text>
                      </HStack>
                      <Text fontSize="sm" color="green.600">
                        You're doing great with protein intake! Keep up the good work.
                      </Text>
                    </Box>
                    
                    <Box p={4} bg="orange.50" borderRadius="md">
                      <HStack spacing={2} mb={2}>
                        <Icon as={FiAlertCircle} color="orange.500" />
                        <Text fontWeight="semibold" color="orange.700">Areas for Improvement</Text>
                      </HStack>
                      <Text fontSize="sm" color="orange.600">
                        Consider reducing processed foods and increasing fiber intake for better digestive health.
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" p="0">
          <ModalHeader borderTopRadius="xl" bg="brand.50" color="brand.900" fontWeight="bold">
            Analyze Food Image
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
              
              <Box>
                <Text fontWeight="semibold" mb={2}>What we'll analyze:</Text>
                <VStack spacing={2} align="stretch" fontSize="sm" color="gray.600">
                  <HStack spacing={2}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text>Food identification and ingredients</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text>Calorie and macronutrient content</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text>Portion size estimation</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text>Nutritional recommendations</Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <Box p={6} borderTop="1px solid" borderColor="gray.200">
            <HStack spacing={4} justify="flex-end">
              <Button variant="ghost" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleAnalyzeFood}
                isLoading={isAnalyzing}
                loadingText="Analyzing..."
              >
                Analyze Food
              </Button>
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
    </Box>
  );
};

export default Nutrition; 