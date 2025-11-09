--Insert a new record into the account table
INSERT INTO account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
)
VALUES (
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
);


--Update the Tony Stark record to change the account_type to 'Admin'
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

--Delete Statement to remove Tony Stark's record from the account table
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

--Update part of text inside inv_description from 'small interiors', 'a huge interior'
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- Select the make and model from inventory and the classification name from classification
SELECT 
    i.inv_make,
    i.inv_model,
    c.classification_name
FROM 
    public.inventory AS i
INNER JOIN 
    public.classification AS c
ON 
    i.classification_id = c.classification_id
WHERE 
    c.classification_name = 'Sport';

--Update all records in the inventory table to add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail columns
UPDATE inventory
SET 
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');