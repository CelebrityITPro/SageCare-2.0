import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Divider,
  Card,
  CardBody,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Input,
  Textarea,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FiBell,
  FiShield,
  FiUser,
  FiMail,
  FiSmartphone,
  FiEye,
  FiEyeOff,
  FiSave,
  FiX,
} from "react-icons/fi";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  nutritionUpdates: boolean;
  marketingEmails: boolean;
  reminderTime: string;
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends";
  showNutritionData: boolean;
  allowDataSharing: boolean;
  showOnlineStatus: boolean;
}

interface AccountSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  theme: "light" | "dark" | "auto";
}

const Settings = () => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    nutritionUpdates: true,
    marketingEmails: false,
    reminderTime: "15",
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: "private",
    showNutritionData: true,
    allowDataSharing: false,
    showOnlineStatus: true,
  });

  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    theme: "light",
  });

  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default settings
    setNotificationSettings({
      emailNotifications: true,
      pushNotifications: true,
      appointmentReminders: true,
      nutritionUpdates: true,
      marketingEmails: false,
      reminderTime: "15",
    });
    
    setPrivacySettings({
      profileVisibility: "private",
      showNutritionData: true,
      allowDataSharing: false,
      showOnlineStatus: true,
    });
    
    setAccountSettings({
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      theme: "light",
    });

    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box w="full">
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Settings & Preferences
          </Heading>
          <Text color="gray.600">
            Manage your account settings, notifications, and privacy preferences
          </Text>
        </Box>

        {/* Settings Tabs */}
        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiBell} />
                <Text>Notifications</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiShield} />
                <Text>Privacy</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiUser} />
                <Text>Account</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Notifications Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Email Notifications</Heading>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="email-notifications" mb="0">
                          Email Notifications
                        </FormLabel>
                        <Switch
                          id="email-notifications"
                          isChecked={notificationSettings.emailNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            emailNotifications: e.target.checked
                          }))}
                        />
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="appointment-reminders" mb="0">
                          Appointment Reminders
                        </FormLabel>
                        <Switch
                          id="appointment-reminders"
                          isChecked={notificationSettings.appointmentReminders}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            appointmentReminders: e.target.checked
                          }))}
                        />
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="nutrition-updates" mb="0">
                          Nutrition Updates
                        </FormLabel>
                        <Switch
                          id="nutrition-updates"
                          isChecked={notificationSettings.nutritionUpdates}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            nutritionUpdates: e.target.checked
                          }))}
                        />
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="marketing-emails" mb="0">
                          Marketing Emails
                        </FormLabel>
                        <Switch
                          id="marketing-emails"
                          isChecked={notificationSettings.marketingEmails}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            marketingEmails: e.target.checked
                          }))}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Push Notifications</Heading>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="push-notifications" mb="0">
                          Push Notifications
                        </FormLabel>
                        <Switch
                          id="push-notifications"
                          isChecked={notificationSettings.pushNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            pushNotifications: e.target.checked
                          }))}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Reminder Time (minutes before)</FormLabel>
                        <Select
                          value={notificationSettings.reminderTime}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            reminderTime: e.target.value
                          }))}
                        >
                          <option value="5">5 minutes</option>
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                        </Select>
                        <FormHelperText>
                          How early to send appointment reminders
                        </FormHelperText>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Privacy Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Profile Privacy</Heading>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Profile Visibility</FormLabel>
                        <Select
                          value={privacySettings.profileVisibility}
                          onChange={(e) => setPrivacySettings(prev => ({
                            ...prev,
                            profileVisibility: e.target.value as "public" | "private" | "friends"
                          }))}
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="friends">Friends Only</option>
                        </Select>
                        <FormHelperText>
                          Who can see your profile information
                        </FormHelperText>
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="show-nutrition" mb="0">
                          Show Nutrition Data
                        </FormLabel>
                        <Switch
                          id="show-nutrition"
                          isChecked={privacySettings.showNutritionData}
                          onChange={(e) => setPrivacySettings(prev => ({
                            ...prev,
                            showNutritionData: e.target.checked
                          }))}
                        />
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="show-online" mb="0">
                          Show Online Status
                        </FormLabel>
                        <Switch
                          id="show-online"
                          isChecked={privacySettings.showOnlineStatus}
                          onChange={(e) => setPrivacySettings(prev => ({
                            ...prev,
                            showOnlineStatus: e.target.checked
                          }))}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Data & Privacy</Heading>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="data-sharing" mb="0">
                          Allow Data Sharing
                        </FormLabel>
                        <Switch
                          id="data-sharing"
                          isChecked={privacySettings.allowDataSharing}
                          onChange={(e) => setPrivacySettings(prev => ({
                            ...prev,
                            allowDataSharing: e.target.checked
                          }))}
                        />
                      </FormControl>
                      
                      <Alert status="info">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Data Privacy</AlertTitle>
                          <AlertDescription>
                            We respect your privacy. Your personal data is encrypted and never shared with third parties without your explicit consent.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Account Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Display & Language</Heading>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Language</FormLabel>
                        <Select
                          value={accountSettings.language}
                          onChange={(e) => setAccountSettings(prev => ({
                            ...prev,
                            language: e.target.value
                          }))}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Theme</FormLabel>
                        <Select
                          value={accountSettings.theme}
                          onChange={(e) => setAccountSettings(prev => ({
                            ...prev,
                            theme: e.target.value as "light" | "dark" | "auto"
                          }))}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Date Format</FormLabel>
                        <Select
                          value={accountSettings.dateFormat}
                          onChange={(e) => setAccountSettings(prev => ({
                            ...prev,
                            dateFormat: e.target.value
                          }))}
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Timezone</FormLabel>
                        <Select
                          value={accountSettings.timezone}
                          onChange={(e) => setAccountSettings(prev => ({
                            ...prev,
                            timezone: e.target.value
                          }))}
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </Select>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Action Buttons */}
        <HStack spacing={4} justify="flex-end">
          <Button
            variant="outline"
            leftIcon={<Icon as={FiX} />}
            onClick={handleResetSettings}
          >
            Reset to Default
          </Button>
          <Button
            colorScheme="brand"
            leftIcon={<Icon as={FiSave} />}
            onClick={handleSaveSettings}
            isLoading={isSaving}
            loadingText="Saving..."
          >
            Save Settings
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Settings; 