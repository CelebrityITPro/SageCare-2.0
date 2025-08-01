import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Card,
  CardBody,
  Badge,
  Icon,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiSearch, FiInfo, FiCheckCircle, FiXCircle, FiFilter } from 'react-icons/fi';


interface Recommendation {
  _id: string;
  userId: string;
  sourceEntryId: {
    _id: string;
    foodItems: string[];
    date: string;
    mealType: string;
  };
  category: string;
  content: string;
  priority: number;
  isFollowed: boolean;
  isIgnored: boolean;
  createdAt: string;
  tags: string[];
}

interface RecommendationsListProps {
  userId: string;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ userId }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://sagecare-api:5000/api'}/nutrition/recommendations/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        throw new Error('Failed to fetch recommendations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://sagecare-api:5000/api'}/nutrition/recommendations/${recommendationId}/follow`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFollowed: true
        }),
      });

      if (response.ok) {
        setRecommendations(prev => 
          prev.map(rec => 
            rec._id === recommendationId 
              ? { ...rec, isFollowed: true }
              : rec
          )
        );
        toast({
          title: "Success",
          description: "Recommendation marked as followed",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to follow recommendation');
      }
    } catch (error) {
      console.error('Failed to follow recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to follow recommendation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleIgnoreRecommendation = async (recommendationId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://sagecare-api:5000/api'}/nutrition/recommendations/${recommendationId}/ignore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isIgnored: true
        }),
      });

      if (response.ok) {
        setRecommendations(prev => 
          prev.map(rec => 
            rec._id === recommendationId 
              ? { ...rec, isIgnored: true }
              : rec
          )
        );
        toast({
          title: "Success",
          description: "Recommendation marked as ignored",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to ignore recommendation');
      }
    } catch (error) {
      console.error('Failed to ignore recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to ignore recommendation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health_tip': return 'green';
      case 'dietary_advice': return 'blue';
      case 'portion_control': return 'orange';
      case 'nutrition_insight': return 'purple';
      case 'meal_suggestion': return 'teal';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'red';
    if (priority >= 3) return 'orange';
    return 'green';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || rec.category === categoryFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'followed' && rec.isFollowed) ||
      (statusFilter === 'ignored' && rec.isIgnored) ||
      (statusFilter === 'pending' && !rec.isFollowed && !rec.isIgnored);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4} color="gray.600">Loading recommendations...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Filters */}
      <Card>
        <CardBody>
          <VStack spacing={4}>
            <Text fontWeight="semibold" fontSize="lg">Filter Recommendations</Text>
            <HStack spacing={4} w="full">
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search recommendations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                placeholder="All Categories"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="health_tip">Health Tips</option>
                <option value="dietary_advice">Dietary Advice</option>
                <option value="portion_control">Portion Control</option>
                <option value="nutrition_insight">Nutrition Insights</option>
                <option value="meal_suggestion">Meal Suggestions</option>
              </Select>
              <Select
                placeholder="All Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="followed">Followed</option>
                <option value="ignored">Ignored</option>
              </Select>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Recommendations List */}
      {filteredRecommendations.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Icon as={FiInfo} size="48px" color="gray.400" mb={4} />
          <Text fontSize="lg" fontWeight="semibold" color="gray.600" mb={2}>
            No recommendations found
          </Text>
          <Text color="gray.500">
            {searchTerm || categoryFilter || statusFilter 
              ? "Try adjusting your filters"
              : "Start analyzing food to get personalized recommendations"
            }
          </Text>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {filteredRecommendations.map((recommendation) => (
            <Card key={recommendation._id} variant="outline">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Header */}
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack spacing={2}>
                        <Badge colorScheme={getCategoryColor(recommendation.category)}>
                          {recommendation.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        <Badge colorScheme={getPriorityColor(recommendation.priority)}>
                          Priority {recommendation.priority}
                        </Badge>
                        {recommendation.isFollowed && (
                          <Badge colorScheme="green">
                            <Icon as={FiCheckCircle} mr={1} />
                            Followed
                          </Badge>
                        )}
                        {recommendation.isIgnored && (
                          <Badge colorScheme="red">
                            <Icon as={FiXCircle} mr={1} />
                            Ignored
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        From: {recommendation.sourceEntryId.foodItems?.[0] || 'Analyzed Food'} ({recommendation.sourceEntryId.mealType})
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(recommendation.createdAt)}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Content */}
                  <Box p={4} bg="blue.50" borderRadius="md">
                    <Text fontSize="md" color="blue.700">
                      {recommendation.content}
                    </Text>
                  </Box>

                  {/* Actions */}
                  {!recommendation.isFollowed && !recommendation.isIgnored && (
                    <HStack spacing={3} justify="flex-end">
                      <Button
                        size="sm"
                        leftIcon={<Icon as={FiXCircle} />}
                        variant="outline"
                        colorScheme="red"
                        onClick={() => handleIgnoreRecommendation(recommendation._id)}
                      >
                        Ignore
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<Icon as={FiCheckCircle} />}
                        colorScheme="green"
                        onClick={() => handleFollowRecommendation(recommendation._id)}
                      >
                        Follow
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </VStack>
  );
};

export default RecommendationsList; 