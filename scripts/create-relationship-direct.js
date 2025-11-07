#!/usr/bin/env node

require('dotenv').config();
const { User, FunderDependent, sequelize } = require('../models');

async function createFunderDependentRelationship() {
    try {
        console.log('🔗 CREATING FUNDER-DEPENDENT RELATIONSHIP');
        console.log('=========================================');
        
        // Test database connection first
        console.log('🔌 Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // Wait a moment for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get users by ID to confirm they exist
        const funder = await User.findByPk(12);
        const dependent = await User.findByPk(13);
        
        if (!funder) {
            console.log('❌ Funder with ID 12 not found');
            return;
        }
        
        if (!dependent) {
            console.log('❌ Dependent with ID 13 not found');
            return;
        }
        
        console.log('✅ Users found:');
        console.log(`   Funder: ${funder.firstName} ${funder.surname} (${funder.email})`);
        console.log(`   Dependent: ${dependent.firstName} ${dependent.surname} (${dependent.email})`);
        
        // Check if relationship already exists
        const existingRelationship = await FunderDependent.findOne({
            where: {
                funderId: 12,
                dependentId: 13
            }
        });
        
        if (existingRelationship) {
            console.log('✅ Relationship already exists!');
            console.log('   ID:', existingRelationship.id);
            console.log('   Created:', existingRelationship.createdAt);
        } else {
            // Create the relationship
            const newRelationship = await FunderDependent.create({
                funderId: 12,
                dependentId: 13
            });
            
            console.log('✅ Relationship created successfully!');
            console.log('   ID:', newRelationship.id);
            console.log('   Funder ID:', newRelationship.funderId);
            console.log('   Dependent ID:', newRelationship.dependentId);
            console.log('   Created:', newRelationship.createdAt);
        }
        
        // Verify the relationship works
        console.log('\n🧪 Verifying relationship...');
        const verification = await FunderDependent.findAll({
            where: { funderId: 12 },
            include: [
                {
                    model: User,
                    as: 'dependent',
                    attributes: ['id', 'firstName', 'surname', 'email']
                },
                {
                    model: User,
                    as: 'funder',
                    attributes: ['id', 'firstName', 'surname', 'email']
                }
            ]
        });
        
        console.log('✅ Verification complete:');
        verification.forEach(link => {
            console.log(`   ${link.funder.firstName} ${link.funder.surname} → ${link.dependent.firstName} ${link.dependent.surname}`);
        });
        
        console.log('\n🎉 SUCCESS! Funder-dependent relationship is established.');
        console.log('💡 Now test with: node scripts/test-funder-after-relationship.js');
        
    } catch (error) {
        console.error('❌ Error creating relationship:', error);
        
        // If there's a connection error, provide SQL alternative
        if (error.name === 'SequelizeConnectionError') {
            console.log('\n💡 CONNECTION ISSUE DETECTED');
            console.log('As an alternative, you can run this SQL directly in your database:');
            console.log('');
            console.log('INSERT INTO "FunderDependents" ("funderId", "dependentId", "createdAt", "updatedAt")');
            console.log('VALUES (12, 13, NOW(), NOW())');
            console.log('ON CONFLICT ("funderId", "dependentId") DO NOTHING;');
        }
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
        process.exit(0);
    }
}

createFunderDependentRelationship();
